import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props { block: PageBlock; open: boolean; onClose: () => void; }

const ColumnsBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const [content, setContent] = useState({ ...block.content });
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const save = async () => { await updateBlock(block.id, { ...content, media }); onClose(); };

  const columns: any[] = content.columns || [{ heading: "", items: [] }, { heading: "", items: [] }];
  const setColumns = (c: any[]) => setContent({ ...content, columns: c });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display">Edit Columns</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Heading (optional)</Label>
            <Input value={content.heading || ""} onChange={(e) => setContent({ ...content, heading: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Subheading (optional)</Label>
            <Input value={content.subheading || ""} onChange={(e) => setContent({ ...content, subheading: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Body (optional)</Label>
            <Textarea value={content.body || ""} onChange={(e) => setContent({ ...content, body: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {columns.map((col, ci) => (
              <div key={ci} className="border border-border rounded-lg p-3 space-y-2">
                <Input placeholder="Column heading" value={col.heading || ""} onChange={(e) => { const n = [...columns]; n[ci] = { ...n[ci], heading: e.target.value }; setColumns(n); }} />
                {(col.items || []).map((item: string, ii: number) => (
                  <div key={ii} className="flex gap-1">
                    <Input value={item} onChange={(e) => { const n = [...columns]; const items = [...n[ci].items]; items[ii] = e.target.value; n[ci] = { ...n[ci], items }; setColumns(n); }} />
                    <button onClick={() => { const n = [...columns]; n[ci] = { ...n[ci], items: n[ci].items.filter((_: any, j: number) => j !== ii) }; setColumns(n); }} className="p-1 text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => { const n = [...columns]; n[ci] = { ...n[ci], items: [...(n[ci].items || []), ""] }; setColumns(n); }}>
                  <Plus className="w-3 h-3 mr-1" /> Item
                </Button>
              </div>
            ))}
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Footnote (optional)</Label>
            <Input value={content.footnote || ""} onChange={(e) => setContent({ ...content, footnote: e.target.value })} />
          </div>
          <BlockMediaEditor media={media} onChange={setMedia} blockType="columns" />
          <Button onClick={save} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnsBlockEditor;
