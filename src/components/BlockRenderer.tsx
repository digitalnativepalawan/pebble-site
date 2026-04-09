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

/* ── TEXT ── */
const TextBlock = ({ content }: { content: any }) => (
  <div className="container px-6">
    <div className="max-w-lg mx-auto" style={{ textAlign: content.alignment || "left" }}>
      {content.label && (
        <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">{content.label}</p>
      )}
      {content.heading && (
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary uppercase tracking-[0.1em] mb-4">
          {content.heading}
        </h2>
      )}
      {content.subheading && (
        <p className="font-body text-base text-muted-foreground mb-12">{content.subheading}</p>
      )}
      {content.body && (
        <div className="space-y-6">
          {content.body.split("\n\n").map((p: string, i: number) => (
            <p key={i} className="font-body text-base text-foreground/70 leading-relaxed">{p}</p>
          ))}
        </div>
      )}
      <BlockMediaDisplay media={content.media} />
    </div>
  </div>
);

/* ── LIST ── */
const ListBlock = ({ content }: { content: any }) => (
  <div className="container px-6">
    <div className="max-w-lg mx-auto">
      {content.heading && (
        <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide mb-6">{content.heading}</h3>
      )}
      {content.label && (
        <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-6">{content.label}</p>
      )}
      <div className="space-y-3 font-body text-base text-foreground/70 leading-relaxed">
        {(content.items || []).map((item: string, i: number) => (
          <p key={i}>— {item}</p>
        ))}
      </div>
      {content.footnote && (
        <p className="font-body text-sm text-muted-foreground mt-6">{content.footnote}</p>
      )}
      <BlockMediaDisplay media={content.media} />
    </div>
  </div>
);

/* ── TABLE ── */
const TableBlock = ({ content }: { content: any }) => {
  const table = content.table;
  if (!table) return null;
  return (
    <div className="container px-6">
      <div className="max-w-lg mx-auto">
        {content.heading && (
          <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide mb-6">{content.heading}</h3>
        )}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {table.headers.map((h: string, i: number) => (
                  <th key={i} className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground text-left px-0 py-3 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row: string[], ri: number) => (
                <tr key={ri} className="border-b border-border hover:bg-transparent">
                  {row.map((cell: string, ci: number) => (
                    <td key={ci} className={`font-body text-sm leading-relaxed px-0 py-3 pr-6 ${ci === 0 ? "text-foreground font-medium" : "text-foreground/70"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden space-y-4">
          {table.rows.map((row: string[], ri: number) => (
            <div key={ri} className="border border-border rounded-lg p-4 space-y-2">
              {row.map((cell: string, ci: number) => (
                <div key={ci} className="flex justify-between items-baseline">
                  <span className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">{table.headers[ci]}</span>
                  <span className={`font-body text-sm ${ci === 0 ? "text-foreground font-medium" : "text-foreground/70"}`}>{cell}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {table.footnote && (
          <p className="font-body text-sm text-muted-foreground mt-8">{table.footnote}</p>
        )}
        <BlockMediaDisplay media={content.media} />
      </div>
    </div>
  );
};

/* ── NUMBERS ── */
const NumbersBlock = ({ content }: { content: any }) => {
  const gridClass = content.layout === "2-column" ? "grid-cols-2" : content.layout === "4-column" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3";
  return (
    <div className="container px-6">
      <div className="max-w-lg mx-auto">
        <div className={`grid ${gridClass} gap-6`}>
          {(content.numbers || []).map((n: any, i: number) => (
            <div key={i} className="bg-card rounded-2xl p-6 border border-border text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">{n.value}</p>
              <p className="font-body text-sm font-medium text-foreground mt-2">{n.label}</p>
              {n.description && <p className="font-body text-xs text-muted-foreground mt-1">{n.description}</p>}
            </div>
          ))}
        </div>
        <BlockMediaDisplay media={content.media} />
      </div>
    </div>
  );
};

/* ── STATS ── */
const StatsBlock = ({ content }: { content: any }) => (
  <div className="container px-6">
    <div className="max-w-md mx-auto">
      <div className="divider mb-6" />
      <div className="flex gap-8">
        {(content.stats || []).map((s: any, i: number) => (
          <div key={i}>
            <p className="font-display text-2xl text-primary">{s.value}</p>
            <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <BlockMediaDisplay media={content.media} />
    </div>
  </div>
);

/* ── IMAGE ── */
const ImageBlock = ({ content }: { content: any }) => {
  if (!content.image_url) return null;
  const maxHeight = content.max_height || 128;
  return (
    <div className="container px-6">
      <div className="max-w-lg mx-auto">
        <img
          src={content.image_url}
          alt={content.alt_text || ""}
          style={{ maxHeight: `${maxHeight}px` }}
          className="w-auto object-contain mx-auto"
          loading="lazy"
        />
        {content.caption && <p className="font-body text-xs text-muted-foreground mt-3 text-center italic">{content.caption}</p>}
        <BlockMediaDisplay media={content.media} />
      </div>
    </div>
  );
};

/* ── VIDEO ── */
const VideoBlock = ({ content }: { content: any }) => {
  if (!content.video_id) return null;
  return (
    <div className="container px-6">
      <div className="max-w-lg mx-auto">
        <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
          <iframe src={`https://www.youtube.com/embed/${content.video_id}`} className="absolute inset-0 w-full h-full" allowFullScreen loading="lazy" />
        </div>
        {content.caption && <p className="font-body text-xs text-muted-foreground mt-3 text-center italic">{content.caption}</p>}
        <BlockMediaDisplay media={content.media} />
      </div>
    </div>
  );
};

/* ── DIVIDER ── */
const DividerBlock = () => (
  <div className="container px-6"><div className="divider" /></div>
);

/* ── TIMELINE ── */
const TimelineBlock = ({ content }: { content: any }) => (
  <div className="container px-6">
    <div className="max-w-lg mx-auto">
      {content.heading && (
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary uppercase tracking-[0.1em] mb-16">{content.heading}</h2>
      )}
      <div className="relative">
        <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-12">
          {(content.entries || []).map((item: any, i: number) => (
            <div key={i} className="relative pl-10">
              <div className="absolute left-0 top-2 h-[7px] w-[7px] rounded-full bg-primary" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-6">
                <span className="font-display text-3xl sm:text-4xl font-normal text-primary leading-none">{item.year}</span>
                <div className="mt-2 sm:mt-0">
                  <p className="font-body text-base text-foreground mb-1">{item.title}</p>
                  <p className="font-body text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BlockMediaDisplay media={content.media} />
    </div>
  </div>
);

/* ── FAQ ── */
const FAQBlock = ({ content }: { content: any }) => (
  <div className="container px-6">
    <div className="max-w-lg mx-auto">
      {content.heading && (
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary uppercase tracking-[0.1em] mb-16">{content.heading}</h2>
      )}
      <Accordion type="single" collapsible>
        {(content.faqs || []).map((faq: any, i: number) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-0 border-b border-border">
            <AccordionTrigger className="font-body text-base text-foreground hover:text-primary py-5 hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="font-body text-base text-muted-foreground pb-5 leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <BlockMediaDisplay media={content.media} />
    </div>
  </div>
);

/* ── COLUMNS ── */
const ColumnsBlock = ({ content }: { content: any }) => (
  <div className="container px-6">
    <div className="max-w-3xl mx-auto">
      {content.heading && (
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary uppercase tracking-[0.1em] mb-4">{content.heading}</h2>
      )}
      {content.subheading && (
        <p className="font-body text-base text-muted-foreground mb-12">{content.subheading}</p>
      )}
      {content.body && (
        <p className="font-body text-base text-foreground/70 leading-relaxed mb-12">{content.body}</p>
      )}
      <div className="grid md:grid-cols-2 gap-12 md:gap-0">
        {(content.columns || []).map((col: any, i: number) => (
          <div key={i} className={i === 0 ? "md:pr-12 md:border-r md:border-border" : "md:pl-12"}>
            {col.heading && (
              <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-6">{col.heading}</p>
            )}
            <div className="space-y-4">
              {(col.items || []).map((item: string, j: number) => (
                <p key={j} className="font-body text-base text-foreground/70">— {item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {content.footnote && (
        <p className="font-body text-sm text-muted-foreground mt-16">{content.footnote}</p>
      )}
      <BlockMediaDisplay media={content.media} />
    </div>
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
const pebbleTicks = [
  { value: 1_000, label: "1,000" },
  { value: 2_200, label: "2,200" },
  { value: 4_000, label: "4,000" },
  { value: 8_000, label: "8,000" },
];

const ResultItem = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div>
    <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">{label}</p>
    <p className={`font-display text-2xl sm:text-3xl font-normal ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-body text-xs text-muted-foreground">{label}</p>
    <p className="font-body text-sm font-medium text-foreground">{value}</p>
  </div>
);

const CalculatorBlock = () => {
  const [tierIndex, setTierIndex] = useState(0);
  const tier = tiers[tierIndex];
  const results = useMemo(() => {
    const ownership = tier.shares / TOTAL_MEMBER_SHARES;
    return {
      ownership,
      annualLow: tier.investment * 0.17,
      annualHigh: tier.investment * 0.20,
      estimatedNights: Math.floor(tier.pebbles / AVG_PEBBLE_COST),
    };
  }, [tier]);

  return (
    <div className="container px-6">
      <div className="max-w-lg mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary uppercase tracking-[0.1em] mb-4">Your Returns</h2>
        <p className="font-body text-base text-muted-foreground mb-16">Select a tier to see your potential.</p>
        <div className="mb-12">
          <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Investment Tier</p>
          <p className="font-display text-4xl sm:text-5xl font-normal text-primary mb-2">{tier.name}</p>
          <p className="font-body text-lg text-foreground/70 mb-6">{fmt(tier.investment)}</p>
          <Slider value={[tierIndex]} onValueChange={([v]) => setTierIndex(v)} min={0} max={3} step={1} />
          <div className="flex justify-between mt-2">
            <span className="font-body text-xs text-muted-foreground">Nova</span>
            <span className="font-body text-xs text-muted-foreground">Polaris</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-10 mb-6">
          <ResultItem label="Shares" value={tier.shares.toLocaleString()} />
          <div>
            <ResultItem label="Ownership" value={`${(results.ownership * 100).toFixed(2)}%`} />
            <p className="font-body text-xs text-muted-foreground mt-2">Your proportional share of the Member Investment Pool.</p>
            <p className="font-body text-xs text-muted-foreground">Total: {TOTAL_PROJECT_SHARES.toLocaleString()} shares · Members: {TOTAL_MEMBER_SHARES.toLocaleString()}</p>
          </div>
          <div>
            <ResultItem label="Annual Pebbles" value={tier.pebbles.toLocaleString()} />
            <div className="mt-3">
              <Progress value={(tier.pebbles / MAX_PEBBLES) * 100} className="h-2" />
              <div className="flex justify-between mt-1">
                {pebbleTicks.map((tick) => (
                  <span key={tick.value} className={`font-body text-[10px] ${tier.pebbles >= tick.value ? "text-primary" : "text-muted-foreground"}`}>{tick.label}</span>
                ))}
              </div>
            </div>
          </div>
          <ResultItem label="Member Pool Share" value={`${(MEMBER_POOL_SHARE * 100).toFixed(0)}%`} />
        </div>
        <div className="mb-10">
          <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Experience Value</p>
          <p className="font-display text-2xl sm:text-3xl font-normal text-primary">~{results.estimatedNights} suite nights per year</p>
          <p className="font-body text-sm text-muted-foreground mt-2">OR multiple shorter stays plus spa, dining, and boat excursions.</p>
        </div>
        <div className="mb-10">
          <p className="font-body text-xs text-muted-foreground leading-relaxed">
            Pebbles are annual experience credits used for accommodation, dining, spa treatments, boat excursions, and curated experiences. They renew every year and encourage members to return and continue their journey.
          </p>
        </div>
        <div className="divider mb-10" />
        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
          <ResultItem label="Est. Annual Return (Low)" value={fmt(results.annualLow)} />
          <ResultItem label="Est. Annual Return (High)" value={fmt(results.annualHigh)} />
          <ResultItem label="Projected ROI" value="17–20%" accent />
          <ResultItem label="Assumptions" value="55% occ." />
        </div>
        <p className="font-body text-xs text-muted-foreground mt-8">Based on conservative assumptions: 55% occupancy, boutique luxury positioning, TIEZA 5% tourism tax.</p>
        <div className="border border-border rounded-2xl p-6 mt-12">
          <p className="font-display text-lg font-bold text-primary uppercase tracking-[0.1em] mb-4">Your Membership Value</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <SummaryRow label="Investment" value={fmt(tier.investment)} />
            <SummaryRow label="Shares" value={tier.shares.toLocaleString()} />
            <SummaryRow label="Annual Pebbles" value={tier.pebbles.toLocaleString()} />
            <SummaryRow label="Estimated Experiences" value={`~${results.estimatedNights} nights`} />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">Projected Financial Return</p>
            <p className="font-display text-2xl font-normal text-primary">{fmt(results.annualLow)} – {fmt(results.annualHigh)}</p>
            <p className="font-body text-xs text-muted-foreground">annually</p>
          </div>
        </div>
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
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
      toast({ title: "Application submitted", description: "We'll be in touch soon." });
      setForm({ first_name: "", last_name: "", email: "", phone: "", country: "", referral_source: "", message: "" });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border-0 border-b border-border bg-transparent px-0 py-3 font-body text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-none";

  return (
    <div className="container px-6">
      <div className="max-w-lg mx-auto">
        <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-8">Apply Now</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" placeholder="First Name *" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} className={inputClass} maxLength={100} />
          <input type="text" placeholder="Last Name *" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} className={inputClass} maxLength={100} />
          <input type="email" placeholder="Email *" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} maxLength={255} />
          <input type="tel" placeholder="Phone *" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} maxLength={30} />
          <select value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass}>
            <option value="">Country *</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="How did you hear about us?" value={form.referral_source} onChange={(e) => update("referral_source", e.target.value)} className={inputClass} maxLength={200} />
          <textarea placeholder="Message (optional)" value={form.message} onChange={(e) => update("message", e.target.value)} className={`${inputClass} min-h-[100px] resize-y`} maxLength={1000} />
          <button type="submit" disabled={submitting} className="font-body text-sm tracking-wide text-primary border border-primary rounded-full px-10 py-4 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50 mt-4">
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── HERO (full-screen with bg image) ── */
const HeroBlock = ({ content }: { content: any }) => {
  const { settings } = useBlocks();
  const siteName = settings?.site_name?.text || "";
  const logoUrl = settings?.logo?.url || null;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      {content.image_url && (
        <img src={content.image_url} alt={content.alt_text || ""} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="relative z-10 text-center px-6 py-20 max-w-2xl mx-auto">
        {logoUrl ? (
          <img src={logoUrl} alt={siteName} className="h-16 w-auto object-contain mx-auto mb-6" />
        ) : content.label ? (
          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">{content.label}</p>
        ) : null}
        {content.heading && (
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-primary uppercase tracking-wide leading-none mb-8">{content.heading}</h1>
        )}
        {content.body && (
          <div className="text-left space-y-4 font-body text-base text-foreground/70 leading-relaxed mb-12">
            {content.body.split("\n\n").map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        {content.cta_text && (
          <button
            onClick={() => { const el = document.querySelector("#join"); el?.scrollIntoView({ behavior: "smooth" }); }}
            className="font-body text-sm tracking-wide text-primary border border-primary rounded-full px-10 py-4 hover:bg-primary/5 transition-all duration-300"
          >
            {content.cta_text}
          </button>
        )}
      </div>
    </section>
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
          <section key={block.id} id={block.content?.section_id || undefined} className={block.block_type === "divider" ? "py-0" : block.block_type === "image" ? "py-4 bg-background" : "section-padding bg-background"}>
            <Component content={block.content} />
          </section>
        );
      })}
    </>
  );
};

export default BlockRenderer;
