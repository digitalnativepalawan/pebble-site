import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props {
  block: PageBlock;
  open: boolean;
  onClose: () => void;
}

const extractYouTubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : url;
};

const VideoBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const [videoUrl, setVideoUrl] = useState(block.content.video_id || "");
  const [caption, setCaption] = useState(block.content.caption || "");
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const save = async () => {
    const videoId = extractYouTubeId(videoUrl);
    await updateBlock(block.id, { video_type: "youtube", video_id: videoId, caption, media });
    onClose();
  };

  const previewId = extractYouTubeId(videoUrl);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {previewId && previewId.length === 11 && (
            <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${previewId}`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          )}
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">YouTube URL or ID</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Caption</Label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <BlockMediaEditor media={media} onChange={setMedia} blockType="video" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoBlockEditor;
