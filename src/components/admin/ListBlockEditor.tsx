import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical } from "lucide-react";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props { block: PageBlock; open: boolean; onClose: () => void; }

const ListBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const [content, setContent] = useState({ ...block.content });
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const save = async () => { await updateBlock(block.id, { ...content, media }); onClose(); };

  const items: string[] = content.items || [];
  const setItems = (newItems: string[]) => setContent({ ...content, items: newItems });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display">Edit List Block</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Heading (optional)</Label>
            <Input value={content.heading || ""} onChange={(e) => setContent({ ...content, heading: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Label (optional)</Label>
            <Input value={content.label || ""} onChange={(e) => setContent({ ...content, label: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider mb-2 block">Items</Label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }} />
                  <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setItems([...items, ""])}>
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Footnote (optional)</Label>
            <Input value={content.footnote || ""} onChange={(e) => setContent({ ...content, footnote: e.target.value })} />
          </div>
          <BlockMediaEditor media={media} onChange={setMedia} blockType="list" />
          <Button onClick={save} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListBlockEditor;
