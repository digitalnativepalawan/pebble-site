import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

interface Props { onAuthenticated: () => void; }

const BUSINESS_TYPES = [
  { value: "resort", label: "🏖️ Resort / Hotel", desc: "Rooms, amenities, bookings" },
  { value: "restaurant", label: "🍽️ Restaurant / Cafe", desc: "Menu, hours, reservations" },
  { value: "tours", label: "🛶 Tour Operator", desc: "Packages, itineraries, rates" },
  { value: "boutique", label: "🛍️ Boutique / Shop", desc: "Products, collections, contact" },
  { value: "portfolio", label: "💼 Portfolio", desc: "Work, services, about" },
  { value: "other", label: "✨ Other", desc: "Custom website" },
];

const STEPS = ["Your Business", "Create Passkey", "All Set!"];

const Onboarding = ({ onAuthenticated }: Props) => {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [passkey, setPasskey] = useState("");
  const [confirmPasskey, setConfirmPasskey] = useState("");
  const [passkeyError, setPasskeyError] = useState("");
  const [saving, setSaving] = useState(false);

  const saveAndContinue = async () => {
    setPasskeyError("");
    if (passkey.length < 4) return setPasskeyError("Must be at least 4 characters");
    if (passkey !== confirmPasskey) return setPasskeyError("Passkeys don't match");
    setSaving(true);
    try {
      await Promise.all([
        supabase.from("site_settings").upsert({ key: "site_name", value: { text: businessName } } as any),
        supabase.from("site_settings").upsert({ key: "tagline", value: { text: tagline } } as any),
        supabase.from("site_settings").upsert({ key: "business_type", value: { text: businessType } } as any),
        supabase.from("site_settings").upsert({ key: "admin_passkey", value: { text: passkey } } as any),
      ]);
      setStep(3);
    } catch (e) {
      setPasskeyError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-display transition-colors ${
                  step > i + 1 ? "bg-primary text-primary-foreground" :
                  step === i + 1 ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`font-body text-xs hidden sm:block ${step === i + 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${step > i + 1 ? "bg-primary" : "bg-border"}`} style={{minWidth: 24}} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Business Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Welcome! Let's set up your site</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">This takes about 2 minutes. You can change everything later.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-body text-sm font-medium text-foreground">What's your business called? <span className="text-destructive">*</span></label>
                <Input value={businessName} onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Baia Beach Resort" autoFocus className="h-11" />
              </div>

              <div className="space-y-1.5">
                <label className="font-body text-sm font-medium text-foreground">
                  One-line description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input value={tagline} onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Escape to the extraordinary" className="h-11" />
                <p className="font-body text-xs text-muted-foreground">Shows under your business name on the site</p>
              </div>

              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-foreground">What kind of business is it?</label>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map(bt => (
                    <button key={bt.value} onClick={() => setBusinessType(bt.value)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        businessType === bt.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted"
                      }`}>
                      <p className="font-body text-sm font-medium text-foreground">{bt.label}</p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{bt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button className="w-full h-12 font-display tracking-wider" onClick={() => setStep(2)} disabled={!businessName.trim()}>
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2 — Passkey */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Create your passkey</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                This is your admin password. You'll use it every time you want to edit your site.
              </p>
            </div>

            <div className="bg-muted rounded-xl p-4 space-y-1">
              <p className="font-body text-xs font-medium text-foreground">Tips for a good passkey:</p>
              <ul className="space-y-0.5">
                {["At least 6 characters long", "Something easy for you to remember", "Don't use your name or business name alone"].map((t, i) => (
                  <li key={i} className="font-body text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-primary">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-body text-sm font-medium text-foreground">Your passkey</label>
                <Input type="password" value={passkey} onChange={e => { setPasskey(e.target.value); setPasskeyError(""); }}
                  placeholder="Min. 4 characters" autoFocus className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="font-body text-sm font-medium text-foreground">Confirm passkey</label>
                <Input type="password" value={confirmPasskey} onChange={e => { setConfirmPasskey(e.target.value); setPasskeyError(""); }}
                  placeholder="Type it again" className="h-11"
                  onKeyDown={e => e.key === "Enter" && saveAndContinue()} />
              </div>
              {passkeyError && <p className="font-body text-sm text-destructive">{passkeyError}</p>}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>← Back</Button>
              <Button className="flex-1 h-12 font-display tracking-wider" onClick={saveAndContinue} disabled={saving}>
                {saving ? "Saving…" : "Create Site →"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {businessName} is ready! 🎉
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Your site is set up. Now let's build it — add your photos, write your story, and share it with the world.
              </p>
            </div>

            <div className="bg-muted rounded-xl p-4 text-left space-y-2">
              <p className="font-body text-xs font-medium text-foreground">What to do next:</p>
              {["Add a cover photo with your business name", "Write an About section", "Add your services or menu with prices", "Share your site URL with customers"].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-body text-xs text-primary font-medium">{i + 1}</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>

            <Button className="w-full h-12 font-display tracking-wider text-sm"
              onClick={() => { localStorage.setItem("pebble_admin_auth", "true"); onAuthenticated(); }}>
              Start Building My Site →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
