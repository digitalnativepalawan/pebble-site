import { useState } from "react";
import { Navigate } from "react-router-dom";
import Provisioner from "@/components/admin/Provisioner";

const LAUNCH_PASSWORD = "palawancollective";

const LaunchPage = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("launch_auth") === "true");
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  if (authed) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-primary">🪨 Pebble Provisioner</h1>
            <p className="font-body text-xs text-muted-foreground">Palawan Collective — internal tool</p>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem("launch_auth"); setAuthed(false); }}
            className="font-body text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5"
          >
            Sign Out
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Provisioner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">🪨 Pebble Provisioner</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">Internal tool — Palawan Collective only</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-body text-sm font-medium text-foreground">Passkey</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  if (pw === LAUNCH_PASSWORD) {
                    sessionStorage.setItem("launch_auth", "true");
                    setAuthed(true);
                  } else setError(true);
                }
              }}
              placeholder="Enter passkey"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground outline-none focus:border-primary"
            />
            {error && <p className="font-body text-xs text-destructive">Incorrect passkey</p>}
          </div>
          <button
            onClick={() => {
              if (pw === LAUNCH_PASSWORD) {
                sessionStorage.setItem("launch_auth", "true");
                setAuthed(true);
              } else setError(true);
            }}
            className="w-full bg-primary text-primary-foreground font-display text-sm tracking-wider py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
