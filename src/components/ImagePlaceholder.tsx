import { useRef } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Trash2 } from "lucide-react";

interface ImagePlaceholderProps {
  section: string;
  imageKey: string;
  className?: string;
  aspectRatio?: string;
  label?: string;
}

const ImagePlaceholder = ({
  section,
  imageKey,
  className = "",
  aspectRatio = "16/9",
  label = "Image",
}: ImagePlaceholderProps) => {
  const { isAdminMode, getImage, uploadImage, deleteImage } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrl = getImage(section, imageKey);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadImage(section, imageKey, file);
  };

  if (!isAdminMode && !imageUrl) return null;

  return (
    <div className={`relative overflow-hidden rounded ${className}`} style={{ aspectRatio }}>
      {imageUrl ? (
        <img src={imageUrl} className="w-full h-full object-cover" alt={label} loading="lazy" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center border border-dashed border-border">
          <span className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </span>
        </div>
      )}

      {isAdminMode && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity"
          >
            <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-body tracking-wide">
              {imageUrl ? "Replace Image" : "Upload Image"}
            </span>
          </button>
          {imageUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteImage(section, imageKey);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors z-10"
              title="Delete image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
