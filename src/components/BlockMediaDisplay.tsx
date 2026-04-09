import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaImage {
  url: string;
  alt: string;
  caption: string;
}

interface MediaData {
  images?: MediaImage[];
  video_url?: string;
  layout?: "single" | "carousel" | "grid";
}

const extractYouTubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
};

const BlockMediaDisplay = ({ media }: { media?: MediaData }) => {
  if (!media) return null;
  const images = media.images || [];
  const videoId = media.video_url ? extractYouTubeId(media.video_url) : "";
  const hasImages = images.length > 0;
  const hasVideo = !!videoId;

  if (!hasImages && !hasVideo) return null;

  return (
    <div className="mt-8 space-y-6">
      {hasImages && images.length === 1 && <SingleImage image={images[0]} />}
      {hasImages && images.length > 1 && media.layout === "grid" && <GridImages images={images} />}
      {hasImages && images.length > 1 && media.layout !== "grid" && <Carousel images={images} />}
      {hasVideo && <VideoEmbed videoId={videoId} />}
    </div>
  );
};

const SingleImage = ({ image }: { image: MediaImage }) => (
  <div>
    <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
      <img src={image.url} alt={image.alt || ""} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    </div>
    {image.caption && <p className="font-body text-xs text-muted-foreground mt-2 text-center italic">{image.caption}</p>}
  </div>
);

const GridImages = ({ images }: { images: MediaImage[] }) => (
  <div className="grid grid-cols-2 gap-3">
    {images.map((img, i) => (
      <div key={i}>
        <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "4/3" }}>
          <img src={img.url} alt={img.alt || ""} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        </div>
        {img.caption && <p className="font-body text-xs text-muted-foreground mt-1 text-center italic">{img.caption}</p>}
      </div>
    ))}
  </div>
);

const Carousel = ({ images }: { images: MediaImage[] }) => {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef(0);

  const goTo = (idx: number) => {
    setCurrent(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const prev = () => goTo(current > 0 ? current - 1 : images.length - 1);
  const next = () => goTo(current < images.length - 1 ? current + 1 : 0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => {
        const n = c < images.length - 1 ? c + 1 : 0;
        scrollRef.current?.children[n]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        return n;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        }}
      >
        {images.map((img, i) => (
          <div key={i} className="min-w-full snap-start">
            <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
              <img src={img.url} alt={img.alt || ""} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        ))}
      </div>

      {/* Arrows - desktop only */}
      <button onClick={prev} className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow">
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>
      <button onClick={next} className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow">
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-muted-foreground/30"}`}
          />
        ))}
      </div>

      {images[current]?.caption && (
        <p className="font-body text-xs text-muted-foreground mt-2 text-center italic">{images[current].caption}</p>
      )}
    </div>
  );
};

const VideoEmbed = ({ videoId }: { videoId: string }) => (
  <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      className="absolute inset-0 w-full h-full"
      allowFullScreen
      loading="lazy"
    />
  </div>
);

export default BlockMediaDisplay;
