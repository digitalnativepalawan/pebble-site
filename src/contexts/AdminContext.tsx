import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";

interface ContentItem {
  section_id: string;
  field_key: string;
  text_value: string | null;
  image_url: string | null;
}

interface MediaItem {
  id: string;
  section_id: string;
  slot_key: string;
  media_type: string;
  image_url: string | null;
  external_url: string | null;
  sort_order: number;
  display_mode: string;
  caption: string | null;
}

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  getContent: (section: string, key: string, fallback: string) => string;
  getImage: (section: string, key: string) => string | null;
  updateContent: (section: string, key: string, value: string) => Promise<void>;
  uploadImage: (section: string, key: string, file: File) => Promise<string | null>;
  deleteImage: (section: string, key: string) => Promise<void>;
  saving: boolean;
  // Media methods
  getMedia: (section: string, slotKey: string) => MediaItem[];
  uploadMediaItem: (section: string, slotKey: string, file: File) => Promise<void>;
  addExternalMedia: (section: string, slotKey: string, url: string, type: string) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;
  reorderMediaItem: (id: string, direction: number) => Promise<void>;
  updateMediaMode: (section: string, slotKey: string, mode: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminMode, setIsAdminMode] = useState(() => localStorage.getItem("amuma_admin") === "true");
  const [content, setContent] = useState<Record<string, Record<string, ContentItem>>>({});
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
    loadMedia();
  }, []);

  const loadContent = async () => {
    try {
      const { data } = await (supabase as any).from("site_content").select("*");
      if (data) {
        const map: Record<string, Record<string, ContentItem>> = {};
        data.forEach((item: any) => {
          if (!map[item.section_id]) map[item.section_id] = {};
          map[item.section_id][item.field_key] = item;
        });
        setContent(map);
      }
    } catch (e) {
      console.log("Could not load site content", e);
    }
  };

  const loadMedia = async () => {
    try {
      const { data } = await (supabase as any).from("section_media").select("*").order("sort_order");
      if (data) setMedia(data);
    } catch (e) {
      console.log("Could not load section media", e);
    }
  };

  const toggleAdminMode = useCallback(() => {
    setIsAdminMode((prev) => {
      const next = !prev;
      localStorage.setItem("amuma_admin", String(next));
      return next;
    });
  }, []);

  const getContent = useCallback(
    (section: string, key: string, fallback: string): string => {
      return content[section]?.[key]?.text_value || fallback;
    },
    [content]
  );

  const getImage = useCallback(
    (section: string, key: string): string | null => {
      return content[section]?.[key]?.image_url || null;
    },
    [content]
  );

  const updateContent = useCallback(async (section: string, key: string, value: string) => {
    setSaving(true);
    try {
      await (supabase as any).from("site_content").upsert(
        { section_id: section, field_key: key, text_value: value, updated_at: new Date().toISOString() },
        { onConflict: "section_id,field_key" }
      );
      setContent((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: {
            section_id: section,
            field_key: key,
            text_value: value,
            image_url: prev[section]?.[key]?.image_url || null,
          },
        },
      }));
    } catch (e) {
      console.error("Failed to save content", e);
    }
    setSaving(false);
  }, []);

  const uploadImage = useCallback(async (section: string, key: string, file: File) => {
    setSaving(true);
    try {
      const optimized = await compressImage(file);
      const ext = optimized.name.split(".").pop();
      const path = `${section}/${key}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, optimized);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      await (supabase as any).from("site_content").upsert(
        { section_id: section, field_key: key, image_url: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: "section_id,field_key" }
      );

      setContent((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: {
            section_id: section,
            field_key: key,
            text_value: prev[section]?.[key]?.text_value || null,
            image_url: publicUrl,
          },
        },
      }));
      setSaving(false);
      return publicUrl;
    } catch (e) {
      console.error("Failed to upload image", e);
      setSaving(false);
      return null;
    }
  }, []);

  const deleteImage = useCallback(async (section: string, key: string) => {
    setSaving(true);
    try {
      await (supabase as any).from("site_content").upsert(
        { section_id: section, field_key: key, image_url: null, updated_at: new Date().toISOString() },
        { onConflict: "section_id,field_key" }
      );
      setContent((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: {
            section_id: section,
            field_key: key,
            text_value: prev[section]?.[key]?.text_value || null,
            image_url: null,
          },
        },
      }));
    } catch (e) {
      console.error("Failed to delete image", e);
    }
    setSaving(false);
  }, []);

  // ── Media methods ──

  const getMedia = useCallback(
    (section: string, slotKey: string): MediaItem[] => {
      return media
        .filter((m) => m.section_id === section && m.slot_key === slotKey)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    [media]
  );

  const uploadMediaItem = useCallback(async (section: string, slotKey: string, file: File) => {
    setSaving(true);
    try {
      const optimized = await compressImage(file);
      const ext = optimized.name.split(".").pop();
      const path = `${section}/${slotKey}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, optimized);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);

      const maxOrder = media
        .filter((m) => m.section_id === section && m.slot_key === slotKey)
        .reduce((max, m) => Math.max(max, m.sort_order), -1);

      const { data } = await (supabase as any).from("section_media").insert({
        section_id: section,
        slot_key: slotKey,
        media_type: "image",
        image_url: urlData.publicUrl,
        sort_order: maxOrder + 1,
      }).select().single();

      if (data) setMedia((prev) => [...prev, data]);
    } catch (e) {
      console.error("Failed to upload media", e);
    }
    setSaving(false);
  }, [media]);

  const addExternalMedia = useCallback(async (section: string, slotKey: string, url: string, type: string) => {
    setSaving(true);
    try {
      const maxOrder = media
        .filter((m) => m.section_id === section && m.slot_key === slotKey)
        .reduce((max, m) => Math.max(max, m.sort_order), -1);

      const { data } = await (supabase as any).from("section_media").insert({
        section_id: section,
        slot_key: slotKey,
        media_type: type,
        external_url: url,
        sort_order: maxOrder + 1,
      }).select().single();

      if (data) setMedia((prev) => [...prev, data]);
    } catch (e) {
      console.error("Failed to add external media", e);
    }
    setSaving(false);
  }, [media]);

  const deleteMediaItem = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await (supabase as any).from("section_media").delete().eq("id", id);
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error("Failed to delete media", e);
    }
    setSaving(false);
  }, []);

  const reorderMediaItem = useCallback(async (id: string, direction: number) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (!item) return prev;
      const slotItems = prev
        .filter((m) => m.section_id === item.section_id && m.slot_key === item.slot_key)
        .sort((a, b) => a.sort_order - b.sort_order);
      const idx = slotItems.findIndex((m) => m.id === id);
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= slotItems.length) return prev;

      const other = slotItems[swapIdx];
      const tempOrder = item.sort_order;
      item.sort_order = other.sort_order;
      other.sort_order = tempOrder;

      // Fire and forget DB updates
      (supabase as any).from("section_media").update({ sort_order: item.sort_order }).eq("id", item.id);
      (supabase as any).from("section_media").update({ sort_order: other.sort_order }).eq("id", other.id);

      return [...prev];
    });
  }, []);

  const updateMediaMode = useCallback(async (section: string, slotKey: string, mode: string) => {
    try {
      await (supabase as any)
        .from("section_media")
        .update({ display_mode: mode })
        .eq("section_id", section)
        .eq("slot_key", slotKey);

      setMedia((prev) =>
        prev.map((m) =>
          m.section_id === section && m.slot_key === slotKey ? { ...m, display_mode: mode } : m
        )
      );
    } catch (e) {
      console.error("Failed to update display mode", e);
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdminMode, toggleAdminMode, getContent, getImage, updateContent, uploadImage, deleteImage, saving,
        getMedia, uploadMediaItem, addExternalMedia, deleteMediaItem, reorderMediaItem, updateMediaMode,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
