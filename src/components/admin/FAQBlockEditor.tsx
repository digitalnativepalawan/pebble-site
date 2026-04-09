import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props { block: PageBlock; open: boolean; onClose: () => void; }

const FAQBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const [content, setContent] = useState({ ...block.content });
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const save = async () => { await updateBlock(block.id, { ...content, media }); onClose(); };

  const faqs: any[] = content.faqs || [];
  const setFaqs = (f: any[]) => setContent({ ...content, faqs: f });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display">Edit FAQ</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Heading (optional)</Label>
            <Input value={content.heading || ""} onChange={(e) => setContent({ ...content, heading: e.target.value })} />
          </div>
          <div>
            <Label className="font-body text-xs uppercase tracking-wider mb-2 block">Questions & Answers</Label>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Question" value={faq.q || ""} onChange={(e) => { const n = [...faqs]; n[i] = { ...n[i], q: e.target.value }; setFaqs(n); }} />
                    <button onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Textarea placeholder="Answer" value={faq.a || ""} onChange={(e) => { const n = [...faqs]; n[i] = { ...n[i], a: e.target.value }; setFaqs(n); }} rows={3} />
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setFaqs([...faqs, { q: "", a: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add FAQ
            </Button>
          </div>
          <BlockMediaEditor media={media} onChange={setMedia} blockType="faq" />
          <Button onClick={save} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FAQBlockEditor;
