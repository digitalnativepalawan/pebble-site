import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props { block: PageBlock; open: boolean; onClose: () => void; }

const TimelineBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const [content, setContent] = useState({ ...block.content });
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const save = async () => { await updateBlock(block.id, { ...content, media }); onClose(); };

  const entries: any[] = content.entries || [];
  const setEntries = (e: any[]) => setContent({ ...content, entries: e });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display">Edit Timeline</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Heading (optional)</Label>
            <Input value={content.heading || ""} onChange={(e) => setContent({ ...content, heading: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider mb-2 block">Entries</Label>
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Year" value={entry.year || ""} onChange={(e) => { const n = [...entries]; n[i] = { ...n[i], year: e.target.value }; setEntries(n); }} className="w-24" />
                    <Input placeholder="Title" value={entry.title || ""} onChange={(e) => { const n = [...entries]; n[i] = { ...n[i], title: e.target.value }; setEntries(n); }} />
                    <button onClick={() => setEntries(entries.filter((_, j) => j !== i))} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input placeholder="Detail" value={entry.detail || ""} onChange={(e) => { const n = [...entries]; n[i] = { ...n[i], detail: e.target.value }; setEntries(n); }} />
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setEntries([...entries, { year: "", title: "", detail: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Entry
            </Button>
          </div>
          <BlockMediaEditor media={media} onChange={setMedia} blockType="timeline" />
          <Button onClick={save} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineBlockEditor;
