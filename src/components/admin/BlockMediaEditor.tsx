import { useState, useRef } from "react";
import { useBlocks } from "@/contexts/BlockContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Image, Video, LayoutGrid, GalleryHorizontal, ImageIcon, Info, ChevronLeft, ChevronRight } from "lucide-react";

export interface MediaData {
  images: { url: string; alt: string; caption: string }[];
  video_url: string;
  layout: "single" | "carousel" | "grid";
}

export const emptyMedia: MediaData = { images: [], video_url: "", layout: "single" };

const guidanceMap: Record<string, { size: string; dims: string; tip: string }> = {
  hero:     { size: "5 MB", dims: "1920 × 1080", tip: "This is your main banner image — make it striking!" },
  text:     { size: "3 MB", dims: "1200 × 800", tip: "A supporting image for your text section." },
  list:     { size: "3 MB", dims: "1200 × 800", tip: "An image to accompany your list." },
  table:    { size: "3 MB", dims: "1200 × 800", tip: "A supporting image for your table." },
  timeline: { size: "2 MB", dims: "800 × 600", tip: "A photo for this milestone." },
  faq:      { size: "3 MB", dims: "1200 × 600", tip: "A header image for your FAQ section." },
  columns:  { size: "3 MB", dims: "1200 × 800", tip: "An image to go with your columns." },
  stats:    { size: "3 MB", dims: "1200 × 600", tip: "A background or accent image." },
  numbers:  { size: "3 MB", dims: "1200 × 600", tip: "A background or accent image." },
  image:    { size: "5 MB", dims: "1920 × 1080", tip: "Your featured image." },
  video:    { size: "3 MB", dims: "1200 × 800", tip: "A thumbnail or supporting image." },
};

const extractYouTubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
};

interface Props {
  media: MediaData;
  onChange: (media: MediaData) => void;
  blockType: string;
}

const BlockMediaEditor = ({ media, onChange, blockType }: Props) => {
  const { mediaItems, uploadMedia } = useBlocks();
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const guidance = guidanceMap[blockType] || guidanceMap.text;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newImages = [...media.images];
    for (const file of Array.from(files)) {
      const item = await uploadMedia(file);
      if (item) newImages.push({ url: item.url, alt: item.alt_text || "", caption: "" });
    }
    onChange({ ...media, images: newImages });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    onChange({ ...media, images: media.images.filter((_, i) => i !== idx) });
  };

  const updateImage = (idx: number, field: "alt" | "caption", val: string) => {
    const updated = media.images.map((img, i) => i === idx ? { ...img, [field]: val } : img);
    onChange({ ...media, images: updated });
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= media.images.length) return;
    const arr = [...media.images];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onChange({ ...media, images: arr });
  };

  const pickFromLibrary = (url: string, alt: string) => {
    onChange({ ...media, images: [...media.images, { url, alt: alt || "", caption: "" }] });
    setShowLibrary(false);
  };

  const previewVideoId = extractYouTubeId(media.video_url);

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-body text-sm font-medium text-foreground">Media Attachments</p>
          <p className="font-body text-xs text-muted-foreground">
            Accepted: <strong>JPG, PNG, WebP</strong> · Max <strong>{guidance.size}</strong> · Recommended: <strong>{guidance.dims}px</strong>
          </p>
          <p className="font-body text-xs text-muted-foreground italic">{guidance.tip}</p>
        </div>
      </div>

      {/* Images section */}
      <div>
        <Label className="font-body text-xs uppercase tracking-wider flex items-center gap-1 mb-2">
          <Image className="w-3 h-3" /> Images
        </Label>

        {media.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {media.images.map((img, i) => (
              <div key={i} className="relative group">
                <div className="aspect-video overflow-hidden rounded border border-border">
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {i > 0 && (
                    <button onClick={() => moveImage(i, -1)} className="bg-card/90 p-1 rounded text-foreground hover:bg-card">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                  {i < media.images.length - 1 && (
                    <button onClick={() => moveImage(i, 1)} className="bg-card/90 p-1 rounded text-foreground hover:bg-card">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => removeImage(i)} className="bg-destructive/90 text-destructive-foreground p-1 rounded hover:bg-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <Input
                  placeholder="Alt text"
                  value={img.alt}
                  onChange={(e) => updateImage(i, "alt", e.target.value)}
                  className="mt-1 h-7 text-xs"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUpload} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="w-3 h-3 mr-1" /> {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowLibrary(!showLibrary)}>
            <ImageIcon className="w-3 h-3 mr-1" /> Media Library
          </Button>
        </div>

        {showLibrary && (
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2 mt-2">
            {mediaItems.filter((m) => m.media_type === "image").map((m) => (
              <button
                key={m.id}
                onClick={() => pickFromLibrary(m.url, m.alt_text || "")}
                className="relative aspect-square overflow-hidden rounded border border-border hover:ring-2 hover:ring-primary"
              >
                <img src={m.url} alt={m.alt_text || ""} className="w-full h-full object-cover" />
              </button>
            ))}
            {mediaItems.filter((m) => m.media_type === "image").length === 0 && (
              <p className="col-span-4 text-xs text-muted-foreground text-center py-4">No images in library yet</p>
            )}
          </div>
        )}

        {media.images.length > 1 && (
          <div className="mt-3">
            <Label className="font-body text-xs uppercase tracking-wider mb-1 block">Display Layout</Label>
            <div className="flex gap-2">
              {([
                { value: "carousel" as const, icon: GalleryHorizontal, label: "Carousel" },
                { value: "grid" as const, icon: LayoutGrid, label: "Grid" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...media, layout: opt.value })}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded font-body text-xs ${
                    media.layout === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <opt.icon className="w-3 h-3" /> {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video section */}
      <div>
        <Label className="font-body text-xs uppercase tracking-wider flex items-center gap-1 mb-2">
          <Video className="w-3 h-3" /> YouTube Video
        </Label>
        <Input
          placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
          value={media.video_url}
          onChange={(e) => onChange({ ...media, video_url: e.target.value })}
        />
        {previewVideoId && (
          <div className="relative w-full overflow-hidden rounded-lg mt-2" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${previewVideoId}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockMediaEditor;
