import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Pencil, Trash2, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";

interface BlockListProps { pageSlug: string; onEdit: (block: PageBlock) => void; onAdd: () => void; }

const typeColors: Record<string, string> = {
  hero: "bg-primary text-primary-foreground",
  text: "bg-secondary text-secondary-foreground",
  list: "bg-accent text-accent-foreground",
  table: "bg-accent text-accent-foreground",
  numbers: "bg-muted text-foreground",
  stats: "bg-muted text-foreground",
  image: "bg-primary/20 text-primary",
  video: "bg-destructive/20 text-destructive",
  timeline: "bg-primary/20 text-primary",
  faq: "bg-secondary/50 text-foreground",
  columns: "bg-muted text-foreground",
  divider: "bg-border text-muted-foreground",
  form: "bg-primary text-primary-foreground",
  calculator: "bg-primary/20 text-primary",
};

const friendlyLabel: Record<string, string> = {
  hero: "🖼️ Cover / Banner",
  text: "✍️ Text Section",
  list: "📋 Bullet List",
  table: "💰 Pricing Table",
  numbers: "🔢 Number Cards",
  stats: "📊 Key Numbers",
  image: "📷 Photo",
  video: "▶️ YouTube Video",
  timeline: "📅 Timeline",
  faq: "❓ Q&A / FAQ",
  columns: "📰 Two Columns",
  divider: "➖ Separator",
  form: "📬 Contact Form",
  calculator: "🧮 Calculator",
};

const getPreview = (block: PageBlock): string => {
  const c = block.content;
  if (block.block_type === "divider") return "───";
  if (block.block_type === "form") return "Application Form";
  if (block.block_type === "calculator") return "Investment Calculator";
  if (c?.heading) return c.heading;
  if (c?.body) return c.body.slice(0, 80) + (c.body.length > 80 ? "..." : "");
  if (c?.items) return `${c.items.length} items: ${(c.items as string[]).slice(0, 2).join(", ")}...`;
  if (c?.table?.headers) return `Table: ${c.table.headers.join(", ")}`;
  if (c?.numbers) return `${c.numbers.length} number cards`;
  if (c?.stats) return `${c.stats.length} stats`;
  if (c?.entries) return `${c.entries.length} timeline entries`;
  if (c?.faqs) return `${c.faqs.length} FAQs`;
  if (c?.columns) return `${c.columns.length} columns`;
  if (c?.image_url) return c.caption || "Image block";
  if (c?.video_id) return c.caption || "Video block";
  if (c?.label) return c.label;
  return "Empty block";
};

const noEditor = ["divider", "form", "calculator"];

interface SortableBlockProps {
  block: PageBlock;
  onEdit: (block: PageBlock) => void;
  toggleBlockVisibility: (id: string) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
}

const SortableBlock = ({ block, onEdit, toggleBlockVisibility, deleteBlock }: SortableBlockProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : (!block.is_visible ? 0.5 : 1),
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing hover:bg-muted rounded mt-1">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-body tracking-wider ${typeColors[block.block_type] || "bg-muted text-foreground"}`}>{friendlyLabel[block.block_type] || block.block_type}</span>
          </div>
          <p className="font-body text-sm text-foreground truncate">{getPreview(block)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => toggleBlockVisibility(block.id)} className="p-2 hover:bg-muted rounded">
            {block.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {!noEditor.includes(block.block_type) && (
            <button onClick={() => onEdit(block)} className="p-2 hover:bg-muted rounded"><Pencil className="w-4 h-4" /></button>
          )}
          <button onClick={() => { if (confirm("Delete this block?")) deleteBlock(block.id); }} className="p-2 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

const BlockList = ({ pageSlug, onEdit, onAdd }: BlockListProps) => {
  const { getBlocksForPage, deleteBlock, toggleBlockVisibility, batchReorder } = useBlocks();
  const pageBlocks = getBlocksForPage(pageSlug);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pageBlocks.findIndex((b) => b.id === active.id);
    const newIndex = pageBlocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(pageBlocks, oldIndex, newIndex);
    await batchReorder(pageSlug, reordered.map((b) => b.id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground capitalize">{pageSlug} — Blocks</h2>
        <Badge variant="secondary">{pageBlocks.length} blocks</Badge>
      </div>

      {pageBlocks.length === 0 && (
        <p className="font-body text-sm text-muted-foreground py-8 text-center">No blocks yet. Add your first block below.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pageBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {pageBlocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onEdit={onEdit}
              toggleBlockVisibility={toggleBlockVisibility}
              deleteBlock={deleteBlock}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button onClick={onAdd} variant="outline" className="w-full mt-4">+ Add New Block</Button>
    </div>
  );
};

export default BlockList;
