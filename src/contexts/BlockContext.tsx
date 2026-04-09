import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { applyTheme } from "@/lib/themeUtils";

export interface PageBlock {
  id: string;
  page_slug: string;
  block_type: string;
  block_order: number;
  content: any;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  alt_text: string | null;
  media_type: string;
  file_size: number | null;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: any;
  updated_at: string;
}

interface BlockContextType {
  blocks: PageBlock[];
  loading: boolean;
  getBlocksForPage: (slug: string) => PageBlock[];
  createBlock: (pageSlug: string, blockType: string, content: any) => Promise<PageBlock | null>;
  updateBlock: (id: string, content: any) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlock: (id: string, direction: number) => Promise<void>;
  batchReorder: (pageSlug: string, orderedIds: string[]) => Promise<void>;
  toggleBlockVisibility: (id: string) => Promise<void>;
  // Media
  mediaItems: MediaItem[];
  uploadMedia: (file: File) => Promise<MediaItem | null>;
  deleteMedia: (id: string) => Promise<void>;
  updateMediaAlt: (id: string, altText: string) => Promise<void>;
  // Settings
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => Promise<void>;
  // Pages
  pages: string[];
}

const BlockContext = createContext<BlockContextType | null>(null);

export const useBlocks = () => {
  const ctx = useContext(BlockContext);
  if (!ctx) throw new Error("useBlocks must be inside BlockProvider");
  return ctx;
};

export const BlockProvider = ({ children }: { children: ReactNode }) => {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  // Apply saved theme to CSS variables whenever settings load or change
  useEffect(() => {
    if (settings.theme) applyTheme(settings.theme);
  }, [settings]);

  const loadAll = async () => {
    setLoading(true);
    const [blocksRes, mediaRes, settingsRes] = await Promise.all([
      supabase.from("page_blocks").select("*").order("block_order"),
      supabase.from("media_library").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*"),
    ]);
    if (blocksRes.data) setBlocks(blocksRes.data as any);
    if (mediaRes.data) setMediaItems(mediaRes.data as any);
    if (settingsRes.data) {
      const map: Record<string, any> = {};
      (settingsRes.data as any[]).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
  };

  const pages = [...new Set(blocks.map((b) => b.page_slug))];

  const getBlocksForPage = useCallback(
    (slug: string) => blocks.filter((b) => b.page_slug === slug).sort((a, b) => a.block_order - b.block_order),
    [blocks]
  );

  const createBlock = useCallback(async (pageSlug: string, blockType: string, content: any) => {
    const pageBlocks = blocks.filter((b) => b.page_slug === pageSlug);
    const maxOrder = pageBlocks.reduce((max, b) => Math.max(max, b.block_order), -1);
    const { data, error } = await supabase.from("page_blocks").insert({
      page_slug: pageSlug,
      block_type: blockType,
      block_order: maxOrder + 1,
      content,
    } as any).select().single();
    if (error) { console.error(error); return null; }
    const block = data as any as PageBlock;
    setBlocks((prev) => [...prev, block]);
    return block;
  }, [blocks]);

  const updateBlock = useCallback(async (id: string, content: any) => {
    // Save version first
    const existing = blocks.find((b) => b.id === id);
    if (existing) {
      await supabase.from("content_versions").insert({
        block_id: id,
        content: existing.content,
      } as any);
    }
    const { error } = await supabase.from("page_blocks").update({ content } as any).eq("id", id);
    if (error) { console.error(error); return; }
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, content } : b));
  }, [blocks]);

  const deleteBlock = useCallback(async (id: string) => {
    await supabase.from("page_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const reorderBlock = useCallback(async (id: string, direction: number) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const pageBlocks = blocks
      .filter((b) => b.page_slug === block.page_slug)
      .sort((a, b) => a.block_order - b.block_order);
    const idx = pageBlocks.findIndex((b) => b.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= pageBlocks.length) return;
    const other = pageBlocks[swapIdx];
    const tempOrder = block.block_order;
    await Promise.all([
      supabase.from("page_blocks").update({ block_order: other.block_order } as any).eq("id", block.id),
      supabase.from("page_blocks").update({ block_order: tempOrder } as any).eq("id", other.id),
    ]);
    setBlocks((prev) => prev.map((b) => {
      if (b.id === block.id) return { ...b, block_order: other.block_order };
      if (b.id === other.id) return { ...b, block_order: tempOrder };
      return b;
    }));
  }, [blocks]);

  const batchReorder = useCallback(async (_pageSlug: string, orderedIds: string[]) => {
    const updates = orderedIds.map((id, idx) =>
      supabase.from("page_blocks").update({ block_order: idx } as any).eq("id", id)
    );
    await Promise.all(updates);
    setBlocks((prev) =>
      prev.map((b) => {
        const newOrder = orderedIds.indexOf(b.id);
        return newOrder !== -1 ? { ...b, block_order: newOrder } : b;
      })
    );
  }, []);

  const toggleBlockVisibility = useCallback(async (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const newVis = !block.is_visible;
    await supabase.from("page_blocks").update({ is_visible: newVis } as any).eq("id", id);
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, is_visible: newVis } : b));
  }, [blocks]);

  // Media
  const uploadMedia = useCallback(async (file: File) => {
    const { compressImage } = await import("@/lib/imageCompression");
    const optimized = await compressImage(file);
    const ext = optimized.name.split(".").pop();
    const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("site-images").upload(path, optimized);
    if (uploadErr) { console.error(uploadErr); return null; }
    const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
    const { data, error } = await supabase.from("media_library").insert({
      filename: file.name,
      url: urlData.publicUrl,
      media_type: file.type.startsWith("image") ? "image" : "file",
      file_size: file.size,
    } as any).select().single();
    if (error) { console.error(error); return null; }
    const item = data as any as MediaItem;
    setMediaItems((prev) => [item, ...prev]);
    return item;
  }, []);

  const deleteMedia = useCallback(async (id: string) => {
    await supabase.from("media_library").delete().eq("id", id);
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMediaAlt = useCallback(async (id: string, altText: string) => {
    await supabase.from("media_library").update({ alt_text: altText } as any).eq("id", id);
    setMediaItems((prev) => prev.map((m) => m.id === id ? { ...m, alt_text: altText } : m));
  }, []);

  // Settings
  const updateSetting = useCallback(async (key: string, value: any) => {
    await supabase.from("site_settings").upsert({ key, value } as any);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <BlockContext.Provider value={{
      blocks, loading, getBlocksForPage, createBlock, updateBlock, deleteBlock,
      reorderBlock, batchReorder, toggleBlockVisibility, mediaItems, uploadMedia, deleteMedia,
      updateMediaAlt, settings, updateSetting, pages,
    }}>
      {children}
    </BlockContext.Provider>
  );
};
