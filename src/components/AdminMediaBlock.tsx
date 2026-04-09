import { useState, useRef } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Trash2, ChevronUp, ChevronDown, Video, FileText, Image, ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

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

interface AdminMediaBlockProps {
  section: string;
  slotKey: string;
  className?: string;
  aspectRatio?: string;
  maxItems?: number;
}

const youtubeEmbedUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

/* ── Locked image container ── */
const ImageContainer = ({ item, aspectRatio }: { item: MediaItem; aspectRatio: string }) => {
  if (!item.image_url) return null;
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-muted"
      style={{ aspectRatio }}
    >
      <img
        src={item.image_url}
        alt={item.caption || ""}
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="lazy"
      />
    </div>
  );
};

/* ── Locked video container (always 16/9) ── */
const VideoContainer = ({ item }: { item: MediaItem }) => {
  if (!item.external_url) return null;
  const embed = youtubeEmbedUrl(item.external_url);
  if (!embed) return <p className="font-body text-sm text-destructive">Invalid YouTube URL</p>;
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-muted" style={{ aspectRatio: "16/9" }}>
      <iframe
        src={embed}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={item.caption || "YouTube video"}
      />
    </div>
  );
};

/* ── GDrive preview card (no inline iframe) ── */
const DrivePreviewCard = ({ item }: { item: MediaItem }) => {
  if (!item.external_url) return null;
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
      <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium text-foreground truncate">
          {item.caption || "Presentation"}
        </p>
        <p className="font-body text-xs text-muted-foreground">Google Drive file</p>
      </div>
      <a
        href={item.external_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
      >
        View <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};

/* ── Render dispatcher ── */
const MediaRenderer = ({ item, aspectRatio }: { item: MediaItem; aspectRatio: string }) => {
  if (item.media_type === "youtube") return <VideoContainer item={item} />;
  if (item.media_type === "gdrive") return <DrivePreviewCard item={item} />;
  if (item.media_type === "image") return <ImageContainer item={item} aspectRatio={aspectRatio} />;
  return null;
};

const AdminMediaBlock = ({
  section,
  slotKey,
  className = "",
  aspectRatio = "16/9",
  maxItems = 4,
}: AdminMediaBlockProps) => {
  const {
    isAdminMode, getMedia, uploadMediaItem, addExternalMedia,
    deleteMediaItem, reorderMediaItem, updateMediaMode,
  } = useAdmin();
  const items = getMedia(section, slotKey);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showDriveInput, setShowDriveInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");

  const displayMode = items[0]?.display_mode || "single";
  const imageItems = items.filter((i) => i.media_type === "image");
  const limitReached = items.length >= maxItems;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = maxItems - items.length;
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      await uploadMediaItem(section, slotKey, files[i]);
    }
    e.target.value = "";
  };

  const handleAddVideo = async () => {
    if (!videoUrl.trim()) return;
    await addExternalMedia(section, slotKey, videoUrl.trim(), "youtube");
    setVideoUrl("");
    setShowVideoInput(false);
  };

  const handleAddDrive = async () => {
    if (!driveUrl.trim()) return;
    await addExternalMedia(section, slotKey, driveUrl.trim(), "gdrive");
    setDriveUrl("");
    setShowDriveInput(false);
  };

  // Public view: render nothing if empty
  if (!isAdminMode && items.length === 0) return null;

  // ── Public rendering ──
  if (!isAdminMode) {
    return (
      <div className={`max-w-full overflow-hidden ${className}`}>
        {/* Non-image items (videos, drive files) */}
        {items.map((item) => {
          if (item.media_type !== "image") {
            return <div key={item.id} className="mb-4"><MediaRenderer item={item} aspectRatio={aspectRatio} /></div>;
          }
          return null;
        })}

        {/* Single image */}
        {imageItems.length > 0 && displayMode === "single" && (
          <ImageContainer item={imageItems[0]} aspectRatio={aspectRatio} />
        )}

        {/* Gallery grid — each cell locked */}
        {imageItems.length > 0 && displayMode === "gallery" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imageItems.map((item) => (
              <ImageContainer key={item.id} item={item} aspectRatio={aspectRatio} />
            ))}
          </div>
        )}

        {/* Carousel — each slide locked */}
        {imageItems.length > 0 && displayMode === "carousel" && (
          <Carousel className="w-full">
            <CarouselContent>
              {imageItems.map((item) => (
                <CarouselItem key={item.id}>
                  <ImageContainer item={item} aspectRatio={aspectRatio} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {imageItems.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm" />
                <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm" />
              </>
            )}
          </Carousel>
        )}
      </div>
    );
  }

  // ── Admin view ──
  return (
    <div className={`border-2 border-dashed border-primary/30 rounded-xl p-4 max-w-full overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
          Media · {section}/{slotKey}
        </p>
        {imageItems.length > 1 && (
          <div className="flex gap-1 ml-auto">
            {(["single", "gallery", "carousel"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateMediaMode(section, slotKey, mode)}
                className={`font-body text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  displayMode === mode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Existing items */}
      <div className="space-y-3 mb-4">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-start gap-2 bg-muted/30 rounded-lg p-2">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="font-body text-[10px] uppercase text-muted-foreground mb-1">
                {item.media_type === "youtube" ? "YouTube" : item.media_type === "gdrive" ? "Google Drive" : "Image"}
              </p>
              <div className="max-h-48 overflow-hidden rounded">
                <MediaRenderer item={item} aspectRatio={aspectRatio} />
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => reorderMediaItem(item.id, -1)}
                disabled={idx === 0}
                className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => reorderMediaItem(item.id, 1)}
                disabled={idx === items.length - 1}
                className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                onClick={() => deleteMediaItem(item.id)}
                className="p-1 text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add buttons — hidden when limit reached */}
      {!limitReached && (
        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Image className="h-3 w-3" /> Add Image
          </button>
          <button
            onClick={() => setShowVideoInput(true)}
            className="flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Video className="h-3 w-3" /> Add Video
          </button>
          <button
            onClick={() => setShowDriveInput(true)}
            className="flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <FileText className="h-3 w-3" /> Add File/Deck
          </button>
        </div>
      )}
      {limitReached && (
        <p className="font-body text-xs text-muted-foreground">Limit reached ({maxItems} items max)</p>
      )}

      {/* URL inputs */}
      {showVideoInput && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube URL"
            className="flex-1 min-w-0 border border-border bg-background rounded-md px-3 py-1.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2 shrink-0">
            <button onClick={handleAddVideo} className="font-body text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md">Add</button>
            <button onClick={() => { setShowVideoInput(false); setVideoUrl(""); }} className="font-body text-xs px-3 py-1.5 text-muted-foreground">Cancel</button>
          </div>
        </div>
      )}
      {showDriveInput && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="Google Drive share URL"
            className="flex-1 min-w-0 border border-border bg-background rounded-md px-3 py-1.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2 shrink-0">
            <button onClick={handleAddDrive} className="font-body text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md">Add</button>
            <button onClick={() => { setShowDriveInput(false); setDriveUrl(""); }} className="font-body text-xs px-3 py-1.5 text-muted-foreground">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaBlock;
