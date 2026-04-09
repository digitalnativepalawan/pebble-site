import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props {
  block: PageBlock;
  open: boolean;
  onClose: () => void;
}

const TextBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const [heading, setHeading] = useState(block.content.heading || "");
  const [subheading, setSubheading] = useState(block.content.subheading || "");
  const [body, setBody] = useState(block.content.body || "");
  const [alignment, setAlignment] = useState(block.content.alignment || "left");
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const save = async () => {
    await updateBlock(block.id, { heading, subheading, body, alignment, media });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Text Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Heading</Label>
            <Input value={heading} onChange={(e) => setHeading(e.target.value)} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Subheading</Label>
            <Input value={subheading} onChange={(e) => setSubheading(e.target.value)} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Alignment</Label>
            <div className="flex gap-2 mt-1">
              {["left", "center", "right"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAlignment(a)}
                  className={`px-4 py-2 rounded font-body text-sm capitalize ${
                    alignment === a ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <BlockMediaEditor media={media} onChange={setMedia} blockType="text" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextBlockEditor;
