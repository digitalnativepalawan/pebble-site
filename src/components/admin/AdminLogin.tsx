import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import Onboarding from "./Onboarding";
import { Lock, Globe } from "lucide-react";

interface Props { onAuthenticated: () => void; }

const AdminLogin = ({ onAuthenticated }: Props) => {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [storedPasskey, setStoredPasskey] = useState<string | null | undefined>(undefined);
  const [siteName, setSiteName] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value") as any;
      if (data) {
        const pk = data.find((r: any) => r.key === "admin_passkey");
        const sn = data.find((r: any) => r.key === "site_name");
        setStoredPasskey(pk ? (pk.value?.text ?? null) : null);
        setSiteName(sn ? (sn.value?.text || sn.value || "") : "");
      } else {
        setStoredPasskey(null);
      }
    };
    fetchSettings();
  }, []);

  if (storedPasskey === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // No passkey set = first time = run onboarding
  if (storedPasskey === null) return <Onboarding onAuthenticated={onAuthenticated} />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === storedPasskey) {
      localStorage.setItem("pebble_admin_auth", "true");
      onAuthenticated();
    } else {
      setError("Incorrect passkey. Try again.");
      setPasskey("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {siteName ? `${siteName} Admin` : "Site Admin"}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Enter your passkey to manage your website
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-body text-sm font-medium text-foreground">Passkey</label>
            <Input
              type="password"
              placeholder="Enter your passkey"
              value={passkey}
              onChange={e => { setPasskey(e.target.value); setError(""); }}
              autoFocus
              className="text-center tracking-widest text-lg h-12"
            />
            {error && <p className="font-body text-sm text-destructive text-center">{error}</p>}
          </div>
          <Button type="submit" className="w-full h-12 font-display tracking-wider text-sm">
            Enter Admin Panel
          </Button>
        </form>

        {/* View site link */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Globe className="w-3.5 h-3.5" />
            View public site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
