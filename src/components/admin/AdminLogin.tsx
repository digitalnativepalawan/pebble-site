import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import Onboarding from "./Onboarding";

interface Props {
  onAuthenticated: () => void;
}

const AdminLogin = ({ onAuthenticated }: Props) => {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [storedPasskey, setStoredPasskey] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const fetchPasskey = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "admin_passkey")
        .maybeSingle();
      setStoredPasskey(data ? (data.value as any)?.text ?? null : null);
    };
    fetchPasskey();
  }, []);

  // Still loading
  if (storedPasskey === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  // First run — no passkey set yet
  if (storedPasskey === null) {
    return <Onboarding onAuthenticated={onAuthenticated} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === storedPasskey) {
      localStorage.setItem("amuma_admin_auth", "true");
      onAuthenticated();
    } else {
      setError("Incorrect passkey");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Admin</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Enter admin passkey</p>
        </div>
        <Input
          type="password"
          placeholder="Passkey"
          value={passkey}
          onChange={(e) => { setPasskey(e.target.value); setError(""); }}
          autoFocus
        />
        {error && <p className="font-body text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">Enter</Button>
      </form>
    </div>
  );
};

export default AdminLogin;
