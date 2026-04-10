import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Provisioner from "./Provisioner";
import { Lock } from "lucide-react";

const LAUNCH_PASS = "palawancollective";

const LaunchTab = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("launch_auth") === "true");
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const attempt = () => {
    if (pw === LAUNCH_PASS) {
      sessionStorage.setItem("launch_auth", "true");
      setAuthed(true);
    } else {
      setError(true);
      setPw("");
    }
  };

  if (authed) return <Provisioner />;

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-display text-base font-semibold text-foreground">Palawan Collective — Internal Tool</h3>
        <p className="font-body text-sm text-muted-foreground mt-1">Enter your passkey to access the site launcher</p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <Input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="Enter passkey..."
          className="text-center tracking-widest"
          autoFocus
        />
        {error && <p className="font-body text-xs text-destructive text-center">Incorrect passkey</p>}
        <Button onClick={attempt} className="w-full font-display tracking-wider">Enter</Button>
      </div>
    </div>
  );
};

export default LaunchTab;
