import { useState, useMemo } from "react";
import { useBlocks } from "@/contexts/BlockContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import BlockMediaDisplay from "@/components/BlockMediaDisplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BlockRendererProps {
  pageSlug: string;
}

/* ── HERO ── */
const HeroBlock = ({ content }: { content: any }) => {
  const { settings } = useBlocks();
  const siteName = settings?.site_name?.text || "";
  const logoUrl = settings?.logo?.url || null;

  const bgImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=1600&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&q=80",
  ];
  const bgImage = content.image_url || bgImages[0];

  return (
    <section className="relative min-h-screen flex items-end justify-start overflow-hidden">
      <img
        src={bgImage}
        alt={content.heading || siteName}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="relative z-10 px-8 pb-20 md:px-16 md:pb-28 max-w-3xl">
        {content.label && (
          <p className="font-body text-xs uppercase tracking-[0.3em] text-white/60 mb-4">
            {content.label}
          </p>
        )}
        {content.heading && (
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-none mb-6">
            {content.heading}
          </h1>
        )}
        {content.subheading && (
          <p className="font-body text-lg text-white/80 mb-4 max-w-xl">{content.subheading}</p>
        )}
        {content.body && (
          <p className="font-body text-base text-white/60 mb-10 max-w-lg leading-relaxed">
            {content.body.split("\n\n")[0]}
          </p>
        )}
        {(content.cta || content.cta_text) && (
          <a
            href={content.cta_target || "#menu"}
            className="inline-block font-body text-sm font-medium tracking-widest text-black bg-white px-8 py-4 rounded-full hover:bg-white/90 transition-all duration-300 uppercase"
          >
            {content.cta || content.cta_text}
          </a>
        )}
      </div>
    </section>
  );
};

/* ── TEXT ── */
const TextBlock = ({ content }: { content: any }) => (
  <div className="max-w-2xl mx-auto px-6 md:px-12">
    {content.label && (
      <p className="font-body text-xs uppercase tracking-[0.25em] text-primary/60 mb-4">{content.label}</p>
    )}
    {content.heading && (
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
        {content.heading}
      </h2>
    )}
    {content.subheading && (
      <p className="font-body text-base text-primary font-medium mb-6">{content.subheading}</p>
    )}
    {content.body && (
      <div className="space-y-4">
        {content.body.split("\n\n").map((p: string, i: number) => (
          <p key={i} className="font-body text-base text-foreground/70 leading-relaxed">{p.split("\n").join(" • ")}</p>
        ))}
      </div>
    )}
    {(content.cta || content.cta_text) && (
      <a
        href={content.cta_target || "#"}
        className="inline-block mt-8 font-body text-sm font-medium tracking-widest text-white bg-primary px-8 py-4 rounded-full hover:bg-primary/90 transition-all duration-300 uppercase"
      >
        {content.cta || content.cta_text}
      </a>
    )}
    <BlockMediaDisplay media={content.media} />
  </div>
);

/* ── LIST ── */
const ListBlock = ({ content }: { content: any }) => (
  <div className="max-w-2xl mx-auto px-6 md:px-12">
    {content.heading && (
      <h3 className="font-display text-2xl font-bold text-foreground mb-6">{content.heading}</h3>
    )}
    {content.label && (
      <p className="font-body text-xs uppercase tracking-[0.2em] text-primary/60 mb-6">{content.label}</p>
    )}
    <div className="grid gap-3">
      {(content.items || []).map((item: string, i: number) => (
        <div key={i} className="flex items-start gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          <p className="font-body text-base text-foreground/70 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
    {content.footnote && (
      <p className="font-body text-sm text-muted-foreground mt-6 italic">{content.footnote}</p>
    )}
    <BlockMediaDisplay media={content.media} />
  </div>
);

/* ── TABLE ── */
const TableBlock = ({ content }: { content: any }) => {
  const table = content.table;
  if (!table) return null;
  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12">
      {content.heading && (
        <h3 className="font-display text-2xl font-bold text-foreground mb-8">{content.heading}</h3>
      )}
      <div className="rounded-2xl overflow-hidden border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-primary/5 border-b border-border">
              {table.headers.map((h: string, i: number) => (
                <th key={i} className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground text-left px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row: string[], ri: number) => (
              <tr key={ri} className={`border-b border-border last:border-0 ${ri % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                {row.map((cell: string, ci: number) => (
                  <td key={ci} className={`font-body text-sm px-5 py-4 ${ci === 0 ? "text-foreground font-medium" : "text-primary font-semibold"}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.footnote && (
        <p className="font-body text-sm text-muted-foreground mt-4 italic">{table.footnote}</p>
      )}
      <BlockMediaDisplay media={content.media} />
    </div>
  );
};

/* ── NUMBERS ── */
const NumbersBlock = ({ content }: { content: any }) => (
  <div className="max-w-2xl mx-auto px-6 md:px-12">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {(content.numbers || []).map((n: any, i: number) => (
        <div key={i} className="bg-primary/5 rounded-2xl p-6 text-center border border-primary/10">
          <p className="font-display text-3xl font-bold text-primary">{n.value}</p>
          <p className="font-body text-sm text-foreground/70 mt-2">{n.label}</p>
        </div>
      ))}
    </div>
    <BlockMediaDisplay media={content.media} />
  </div>
);

/* ── STATS ── */
const StatsBlock = ({ content }: { content: any }) => (
  <div className="max-w-2xl mx-auto px-6 md:px-12">
    <div className="flex gap-10 flex-wrap">
      {(content.stats || []).map((s: any, i: number) => (
        <div key={i}>
          <p className="font-display text-4xl text-primary font-bold">{s.value}</p>
          <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>
    <BlockMediaDisplay media={content.media} />
  </div>
);

/* ── IMAGE ── */
const ImageBlock = ({ content }: { content: any }) => {
  if (!content.image_url) return null;
  return (
    <div className="max-w-3xl mx-auto px-6">
      <img
        src={content.image_url}
        alt={content.alt_text || ""}
        className="w-full rounded-2xl object-cover"
        style={{ maxHeight: `${content.max_height || 480}px` }}
        loading="lazy"
      />
      {content.caption && (
        <p className="font-body text-xs text-muted-foreground mt-3 text-center italic">{content.caption}</p>
      )}
      <BlockMediaDisplay media={content.media} />
    </div>
  );
};

/* ── VIDEO ── */
const VideoBlock = ({ content }: { content: any }) => {
  if (!content.video_id) return null;
  return (
    <div className="max-w-3xl mx-auto px-6">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-xl" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={`https://www.youtube.com/embed/${content.video_id}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {content.caption && (
        <p className="font-body text-xs text-muted-foreground mt-3 text-center italic">{content.caption}</p>
      )}
    </div>
  );
};

/* ── DIVIDER ── */
const DividerBlock = () => (
  <div className="max-w-2xl mx-auto px-6">
    <div className="h-px bg-border" />
  </div>
);

/* ── TIMELINE ── */
const TimelineBlock = ({ content }: { content: any }) => (
  <div className="max-w-2xl mx-auto px-6 md:px-12">
    {content.heading && (
      <h2 className="font-display text-3xl font-bold text-foreground mb-12">{content.heading}</h2>
    )}
    <div className="relative">
      <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-10">
        {(content.entries || []).map((item: any, i: number) => (
          <div key={i} className="relative pl-10">
            <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-6">
              <span className="font-display text-2xl font-bold text-primary leading-none">{item.year}</span>
              <div className="mt-2 sm:mt-0">
                <p className="font-body text-base font-medium text-foreground">{item.title}</p>
                <p className="font-body text-sm text-muted-foreground mt-1">{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <BlockMediaDisplay media={content.media} />
  </div>
);

/* ── FAQ ── */
const FAQBlock = ({ content }: { content: any }) => (
  <div className="max-w-2xl mx-auto px-6 md:px-12">
    {content.heading && (
      <h2 className="font-display text-3xl font-bold text-foreground mb-10">{content.heading}</h2>
    )}
    <Accordion type="single" collapsible className="space-y-2">
      {(content.faqs || []).map((faq: any, i: number) => (
        <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-5 data-[state=open]:bg-primary/5">
          <AccordionTrigger className="font-body text-base font-medium text-foreground hover:text-primary py-4 hover:no-underline text-left">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="font-body text-sm text-muted-foreground pb-4 leading-relaxed">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
    <BlockMediaDisplay media={content.media} />
  </div>
);

/* ── COLUMNS ── */
const ColumnsBlock = ({ content }: { content: any }) => (
  <div className="max-w-3xl mx-auto px-6 md:px-12">
    {content.heading && (
      <h2 className="font-display text-3xl font-bold text-foreground mb-3">{content.heading}</h2>
    )}
    {content.subheading && (
      <p className="font-body text-base text-primary font-medium mb-6">{content.subheading}</p>
    )}
    {content.body && (
      <p className="font-body text-base text-foreground/70 leading-relaxed mb-10">{content.body}</p>
    )}
    <div className="grid md:grid-cols-2 gap-8">
      {(content.columns || []).map((col: any, i: number) => (
        <div key={i} className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
          {col.heading && (
            <p className="font-body text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-4">{col.heading}</p>
          )}
          <div className="space-y-3">
            {(col.items || []).map((item: string, j: number) => (
              <div key={j} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <p className="font-body text-sm text-foreground/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    {content.footnote && (
      <p className="font-body text-sm text-muted-foreground mt-8 italic">{content.footnote}</p>
    )}
    <BlockMediaDisplay media={content.media} />
  </div>
);

/* ── CALCULATOR ── */
const tiers = [
  { name: "Nova", investment: 500_000, shares: 50, pebbles: 1_000 },
  { name: "Aurora", investment: 1_200_000, shares: 120, pebbles: 2_200 },
  { name: "Orion", investment: 2_000_000, shares: 210, pebbles: 4_000 },
  { name: "Polaris", investment: 4_000_000, shares: 440, pebbles: 8_000 },
];
const TOTAL_MEMBER_SHARES = 2_800;
const TOTAL_PROJECT_SHARES = 4_400;
const MEMBER_POOL_SHARE = 0.60;
const MAX_PEBBLES = 8_000;
const AVG_PEBBLE_COST = 200;
const fmt = (n: number) => "₱" + Math.round(n).toLocaleString();

const CalculatorBlock = () => {
  const [tierIndex, setTierIndex] = useState(0);
  const tier = tiers[tierIndex];
  const results = useMemo(() => ({
    ownership: tier.shares / TOTAL_MEMBER_SHARES,
    annualLow: tier.investment * 0.17,
    annualHigh: tier.investment * 0.20,
    estimatedNights: Math.floor(tier.pebbles / AVG_PEBBLE_COST),
  }), [tier]);

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12">
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">Your Returns</h2>
      <p className="font-body text-base text-muted-foreground mb-10">Select a tier to see your potential.</p>
      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
        <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Investment Tier</p>
        <p className="font-display text-4xl font-bold text-primary">{tier.name} — {fmt(tier.investment)}</p>
        <div className="mt-6">
          <Slider value={[tierIndex]} onValueChange={([v]) => setTierIndex(v)} min={0} max={3} step={1} />
          <div className="flex justify-between mt-2">
            {tiers.map((t, i) => (
              <span key={i} className={`font-body text-xs ${i === tierIndex ? "text-primary font-semibold" : "text-muted-foreground"}`}>{t.name}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "Shares", value: tier.shares.toLocaleString() },
          { label: "Ownership", value: `${(results.ownership * 100).toFixed(2)}%` },
          { label: "Annual Pebbles", value: tier.pebbles.toLocaleString() },
          { label: "Est. Nights/Year", value: `~${results.estimatedNights}` },
        ].map((item, i) => (
          <div key={i} className="bg-background rounded-xl p-4 border border-border">
            <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="font-display text-2xl font-bold text-primary">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-primary text-white rounded-2xl p-6">
        <p className="font-body text-xs uppercase tracking-widest opacity-70 mb-2">Projected Annual Return</p>
        <p className="font-display text-4xl font-bold">{fmt(results.annualLow)} – {fmt(results.annualHigh)}</p>
        <p className="font-body text-sm opacity-70 mt-2">17–20% ROI · 55% occupancy assumption</p>
      </div>
    </div>
  );
};

/* ── FORM ── */
const countries = ["Philippines", "Germany", "United Kingdom", "United States", "Spain", "France", "Japan", "Australia", "Singapore", "Other"];

const FormBlock = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", country: "", referral_source: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.phone.trim() || !form.country) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("applications").insert({
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        email: form.email.trim(), phone: form.phone.trim(), country: form.country,
        referral_source: form.referral_source.trim() || null, message: form.message.trim() || null,
      });
      if (error) throw error;
      toast({ title: "Submitted!", description: "We'll be in touch soon." });
      setForm({ first_name: "", last_name: "", email: "", phone: "", country: "", referral_source: "", message: "" });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border-0 border-b border-border bg-transparent px-0 py-3 font-body text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-none";

  return (
    <div className="max-w-lg mx-auto px-6 md:px-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <input type="text" placeholder="First Name *" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} className={inputClass} />
          <input type="text" placeholder="Last Name *" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} className={inputClass} />
        </div>
        <input type="email" placeholder="Email *" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
        <input type="tel" placeholder="Phone *" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
        <select value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass}>
          <option value="">Country *</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea placeholder="Message (optional)" value={form.message} onChange={(e) => update("message", e.target.value)} className={`${inputClass} min-h-[100px] resize-y`} />
        <button type="submit" disabled={submitting} className="w-full font-body text-sm font-medium tracking-widest text-white bg-primary px-8 py-4 rounded-full hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 uppercase">
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

/* ── BLOCK MAP ── */
const blockComponents: Record<string, React.FC<{ content: any }>> = {
  hero: HeroBlock,
  text: TextBlock,
  list: ListBlock,
  table: TableBlock,
  numbers: NumbersBlock,
  stats: StatsBlock,
  image: ImageBlock,
  video: VideoBlock,
  divider: DividerBlock,
  timeline: TimelineBlock,
  faq: FAQBlock,
  columns: ColumnsBlock,
  calculator: CalculatorBlock,
  form: FormBlock,
};

const BlockRenderer = ({ pageSlug }: BlockRendererProps) => {
  const { getBlocksForPage, loading } = useBlocks();
  const blocks = getBlocksForPage(pageSlug);
  const visibleBlocks = blocks.filter((b) => b.is_visible);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (visibleBlocks.length === 0) return null;

  return (
    <>
      {visibleBlocks.map((block) => {
        const Component = blockComponents[block.block_type];
        if (!Component) return null;
        if (block.block_type === "hero") {
          return <Component key={block.id} content={block.content} />;
        }
        return (
          <section
            key={block.id}
            id={block.content?.section_id || undefined}
            className={
              block.block_type === "divider"
                ? "py-8"
                : block.block_type === "image"
                ? "py-6 bg-background"
                : "py-16 bg-background"
            }
          >
            <Component content={block.content} />
          </section>
        );
      })}
    </>
  );
};

export default BlockRenderer;
