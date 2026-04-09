import { useState, useEffect } from "react";
import { useBlocks } from "@/contexts/BlockContext";
import { CheckCircle2, Circle } from "lucide-react";

const CHECKLIST_ITEMS = [
  {
    key: "hero",
    label: "Add your cover photo & business name",
    description: "This is the first thing visitors see",
    blockType: "hero",
  },
  {
    key: "about",
    label: "Write your About section",
    description: "Tell visitors your story",
    blockType: "text",
  },
  {
    key: "offerings",
    label: "Add your rooms, menu, or services",
    description: "Show what you offer with prices",
    blockType: "table",
  },
  {
    key: "contact",
    label: "Add your contact info",
    description: "Phone, email, location",
    blockType: "text",
  },
  {
    key: "faq",
    label: "Add a Q&A section",
    description: "Answer common questions",
    blockType: "faq",
  },
];

interface SiteChecklistProps {
  onAddBlock: () => void;
}

const SiteChecklist = ({ onAddBlock }: SiteChecklistProps) => {
  const { getBlocksForPage } = useBlocks();
  const blocks = getBlocksForPage("home");
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("checklist_dismissed") === "true");

  const blockTypes = blocks.map(b => b.block_type);
  const hasHero = blockTypes.includes("hero");
  const hasText = blockTypes.filter(t => t === "text").length >= 1;
  const hasTable = blockTypes.includes("table") || blockTypes.includes("list");
  const hasFaq = blockTypes.includes("faq");
  const totalBlocks = blocks.length;

  const checks = [
    hasHero,
    hasText,
    hasTable,
    totalBlocks >= 4,
    hasFaq,
  ];

  const completed = checks.filter(Boolean).length;
  const allDone = completed === checks.length;

  if (dismissed || allDone) return null;

  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">Build your site — {completed}/{checks.length} done</h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Complete these steps to have a great website</p>
        </div>
        <button
          onClick={() => { localStorage.setItem("checklist_dismissed", "true"); setDismissed(true); }}
          className="font-body text-xs text-muted-foreground hover:text-foreground"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-border rounded-full mb-4">
        <div
          className="h-1.5 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(completed / checks.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item, i) => {
          const done = checks[i];
          return (
            <div key={item.key} className="flex items-start gap-3">
              {done
                ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                : <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className={`font-body text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {item.label}
                </p>
                {!done && (
                  <p className="font-body text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
              {!done && (
                <button
                  onClick={onAddBlock}
                  className="font-body text-xs text-primary hover:underline shrink-0"
                >
                  Add →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SiteChecklist;
