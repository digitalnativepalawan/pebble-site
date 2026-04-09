import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props {
  block: PageBlock;
  open: boolean;
  onClose: () => void;
}

const StatsBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const [stats, setStats] = useState<{ value: string; label: string }[]>(
    (block.content.stats || []).map((s: any) => ({ ...s }))
  );
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const update = (idx: number, field: "value" | "label", val: string) => {
    setStats(stats.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const save = async () => {
    await updateBlock(block.id, { stats, media });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Stats</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input placeholder="Value" value={s.value} onChange={(e) => update(i, "value", e.target.value)} className="w-28" />
              <Input placeholder="Label" value={s.label} onChange={(e) => update(i, "label", e.target.value)} className="flex-1" />
              <button onClick={() => setStats(stats.filter((_, j) => j !== i))} className="text-destructive p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setStats([...stats, { value: "", label: "" }])}>
            <Plus className="w-3 h-3 mr-1" /> Add Stat
          </Button>
          <BlockMediaEditor media={media} onChange={setMedia} blockType="stats" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsBlockEditor;
