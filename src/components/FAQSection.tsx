import { useScrollReveal } from "@/hooks/useScrollReveal";
import AdminMediaBlock from "@/components/AdminMediaBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What are Membership Stakes?", a: "Membership Stakes represent your participation in the creation and economic success of an AMUMA retreat. Members become both participants in the lifestyle and partners in the retreat's success." },
  { q: "What are Pebbles?", a: "Pebbles are annual experience credits. They can be used for accommodation, dining, excursions, boat trips, and spa treatments. They renew every year." },
  { q: "Can I sell my stakes?", a: "Yes, stakes are transferable to other verified members within the AMUMA ecosystem." },
  { q: "How do I receive my revenue?", a: "Accommodation revenue is distributed from a shared rental pool. 60% goes to Membership Shareholders, 40% to the AMUMA Operator." },
  { q: "What's the minimum investment?", a: "The Nova tier starts at ₱500,000 for 50 shares and 1,000 annual Pebbles." },
  { q: "What is the Founding Circle?", a: "The first 20 Nova investors become the Founding Circle and receive early access to future AMUMA retreats." },
  { q: "Can companies invest?", a: "Yes. AMUMA welcomes corporate investors, family offices, and entities." },
  { q: "What returns can I expect?", a: "Based on conservative assumptions (55% occupancy, boutique luxury positioning), projected annual ROI is 17–20%." },
];

const FAQSection = () => {
  const headingRef = useScrollReveal();

  return (
    <section id="faq" className="section-padding bg-background">
      <div className="container px-6">
        <div ref={headingRef} className="scroll-reveal mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary uppercase tracking-[0.1em]">
            FAQ
          </h2>
        </div>

        <div className="max-w-lg">
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-0 border-b border-border"
              >
                <AccordionTrigger className="font-body text-base text-foreground hover:text-primary py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-base text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <AdminMediaBlock section="faq" slotKey="after_body" className="mt-8 max-w-lg" aspectRatio="16/9" maxItems={1} />
      </div>
    </section>
  );
};

export default FAQSection;
