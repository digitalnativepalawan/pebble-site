import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onAuthenticated: () => void;
}

const BUSINESS_TYPES = ["Resort", "Restaurant", "Boutique", "Portfolio", "Other"] as const;

const Onboarding = ({ onAuthenticated }: Props) => {
  const [step, setStep] = useState(1);

  // Step 1
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [businessType, setBusinessType] = useState("");

  // Step 2
  const [passkey, setPasskey] = useState("");
  const [confirmPasskey, setConfirmPasskey] = useState("");
  const [passkeyError, setPasskeyError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleStep1Continue = () => {
    if (!businessName.trim()) return;
    setStep(2);
  };

  const handleStep2Continue = async () => {
    setPasskeyError("");
    if (passkey.length < 4) {
      setPasskeyError("Passkey must be at least 4 characters");
      return;
    }
    if (passkey !== confirmPasskey) {
      setPasskeyError("Passkeys don't match");
      return;
    }
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
      console.error("Failed to save settings", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full space-y-8">

        {step === 1 && (
          <>
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Step 1 of 3
              </p>
              <h1 className="font-display text-2xl font-bold text-primary">Set up your business</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">Tell us about your site</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Business name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Baia Beach Resort"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Tagline <span className="text-muted-foreground/50">(optional)</span>
                </Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Escape to the extraordinary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Business type
                </Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="font-body text-sm">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="font-body text-sm">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleStep1Continue}
              disabled={!businessName.trim()}
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Step 2 of 3
              </p>
              <h1 className="font-display text-2xl font-bold text-primary">Set your passkey</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                You'll use this to access the admin dashboard
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Passkey
                </Label>
                <Input
                  type="password"
                  value={passkey}
                  onChange={(e) => { setPasskey(e.target.value); setPasskeyError(""); }}
                  placeholder="Min. 4 characters"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Confirm passkey
                </Label>
                <Input
                  type="password"
                  value={confirmPasskey}
                  onChange={(e) => { setConfirmPasskey(e.target.value); setPasskeyError(""); }}
                  placeholder="Repeat passkey"
                />
              </div>
              {passkeyError && (
                <p className="font-body text-sm text-destructive">{passkeyError}</p>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleStep2Continue}
              disabled={saving}
            >
              {saving ? "Saving…" : "Continue"}
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Step 3 of 3
              </p>
              <h1 className="font-display text-2xl font-bold text-primary">Your site is ready</h1>
              <p className="font-body text-sm text-muted-foreground mt-2">
                Welcome,{" "}
                <span className="font-body font-semibold text-foreground">{businessName}</span>
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                localStorage.setItem("pebble_admin_auth", "true");
                onAuthenticated();
              }}
            >
              Set up your site
            </Button>
          </>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
