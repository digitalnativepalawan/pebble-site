import { useRef, useState } from "react";
import { useBlocks } from "@/contexts/BlockContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MediaLibrary = () => {
  const { mediaItems, uploadMedia, deleteMedia, updateMediaAlt } = useBlocks();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadMedia(file);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied", description: "Image URL copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Media Library</h2>
        <div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-1" /> {uploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>
      </div>

      {mediaItems.length === 0 && (
        <p className="font-body text-sm text-muted-foreground py-8 text-center">
          No media uploaded yet.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {mediaItems.map((item) => (
          <div key={item.id} className="border border-border rounded-lg overflow-hidden bg-card group">
            <div className="relative aspect-square overflow-hidden">
              <img src={item.url} alt={item.alt_text || ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} className="bg-card p-2 rounded-full">
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Delete this image?")) deleteMedia(item.id); }}
                  className="bg-destructive text-destructive-foreground p-2 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="font-body text-xs text-muted-foreground truncate">{item.filename}</p>
              {editingAlt === item.id ? (
                <Input
                  defaultValue={item.alt_text || ""}
                  placeholder="Alt text"
                  className="mt-1 h-7 text-xs"
                  onBlur={(e) => { updateMediaAlt(item.id, e.target.value); setEditingAlt(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { updateMediaAlt(item.id, (e.target as any).value); setEditingAlt(null); } }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setEditingAlt(item.id)}
                  className="font-body text-xs text-primary hover:underline mt-1 block"
                >
                  {item.alt_text || "Add alt text"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
