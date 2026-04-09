import { useBlocks } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Type, Image, Video, Table2, Hash, BarChart3, List, Clock, HelpCircle, Minus, Columns, FileText, Calculator } from "lucide-react";

const defaultMedia = { images: [], video_url: "", layout: "single" };

const blockTypes = [
  { type: "text", label: "Text", icon: Type, defaultContent: { heading: "", subheading: "", body: "", alignment: "left", media: { ...defaultMedia } } },
  { type: "list", label: "List", icon: List, defaultContent: { heading: "", items: [""], footnote: "", media: { ...defaultMedia } } },
  { type: "table", label: "Table", icon: Table2, defaultContent: { table: { headers: ["Column 1", "Column 2"], rows: [["", ""]], footnote: "" }, media: { ...defaultMedia } } },
  { type: "numbers", label: "Numbers", icon: Hash, defaultContent: { numbers: [{ label: "Label", value: "0", description: "" }], layout: "3-column", media: { ...defaultMedia } } },
  { type: "stats", label: "Stats", icon: BarChart3, defaultContent: { stats: [{ value: "0", label: "Stat" }], media: { ...defaultMedia } } },
  { type: "image", label: "Image", icon: Image, defaultContent: { image_url: "", alt_text: "", caption: "", alignment: "center", media: { ...defaultMedia } } },
  { type: "video", label: "Video", icon: Video, defaultContent: { video_type: "youtube", video_id: "", caption: "", media: { ...defaultMedia } } },
  { type: "timeline", label: "Timeline", icon: Clock, defaultContent: { heading: "", entries: [{ year: "", title: "", detail: "" }], media: { ...defaultMedia } } },
  { type: "faq", label: "FAQ", icon: HelpCircle, defaultContent: { heading: "", faqs: [{ q: "", a: "" }], media: { ...defaultMedia } } },
  { type: "columns", label: "Columns", icon: Columns, defaultContent: { heading: "", columns: [{ heading: "", items: [] }, { heading: "", items: [] }], media: { ...defaultMedia } } },
  { type: "divider", label: "Divider", icon: Minus, defaultContent: {} },
  { type: "form", label: "Form", icon: FileText, defaultContent: {} },
  { type: "calculator", label: "Calculator", icon: Calculator, defaultContent: {} },
];

interface AddBlockModalProps { open: boolean; onClose: () => void; pageSlug: string; }

const AddBlockModal = ({ open, onClose, pageSlug }: AddBlockModalProps) => {
  const { createBlock } = useBlocks();

  const handleAdd = async (type: string, content: any) => {
    await createBlock(pageSlug, type, content);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display">Add New Block</DialogTitle></DialogHeader>
        <div className="grid grid-cols-3 gap-3 pt-4">
          {blockTypes.map((bt) => (
            <button key={bt.type} onClick={() => handleAdd(bt.type, bt.defaultContent)} className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <bt.icon className="w-5 h-5 text-primary" />
              <span className="font-body text-xs">{bt.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockModal;
