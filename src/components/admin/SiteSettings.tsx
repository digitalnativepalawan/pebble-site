import { useState, useEffect, useCallback, useRef } from "react";
import { useBlocks } from "@/contexts/BlockContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { hexToHsl, hslToHex, applyTheme, DEFAULT_THEME } from "@/lib/themeUtils";
import { supabase } from "@/integrations/supabase/client";

const COLOR_ROLES = [
  { key: "background", label: "Page Background", description: "Main background color of the entire site" },
  { key: "foreground", label: "Text Color", description: "Body text and general content color" },
  { key: "primary", label: "Primary Color", description: "Buttons, active states, and key highlights" },
  { key: "secondary", label: "Accent Color", description: "Secondary highlights and decorative elements" },
  { key: "border", label: "Border Color", description: "Lines, dividers, and input borders" },
];

interface ColorRowProps {
  label: string;
  description: string;
  hex: string;
  onChange: (hex: string) => void;
}

const ColorRow = ({ label, description, hex, onChange }: ColorRowProps) => {
  const [inputVal, setInputVal] = useState(hex);
  useEffect(() => { setInputVal(hex); }, [hex]);
  const handleTextChange = (val: string) => {
    setInputVal(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) onChange(val);
  };
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded border border-border shadow-sm overflow-hidden cursor-pointer" style={{ backgroundColor: hex }}>
          <input
            type="color"
            value={hex}
            onChange={(e) => { onChange(e.target.value); setInputVal(e.target.value); }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium text-foreground">{label}</p>
        <p className="font-body text-xs text-muted-foreground">{description}</p>
      </div>
      <Input
        value={inputVal}
        onChange={(e) => handleTextChange(e.target.value)}
        className="w-28 font-mono text-xs uppercase"
        maxLength={7}
        placeholder="#000000"
      />
    </div>
  );
};

const SiteSettings = () => {
  const { settings, updateSetting } = useBlocks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    setLogoUrl(settings?.logo?.url || null);
  }, [settings?.logo]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logo/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
      const url = urlData.publicUrl;
      await updateSetting("logo", { url });
      setLogoUrl(url);
      toast({ title: "Logo uploaded", description: "Your logo is now live on the site." });
    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", description: "Please try again." });
    }
    setLogoUploading(false);
  };

  const removeLogo = async () => {
    await updateSetting("logo", { url: null });
    setLogoUrl(null);
    toast({ title: "Logo removed", description: "Site name text will show instead." });
  };

  // Theme
  const [themeHex, setThemeHex] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = settings.theme || {};
    const hexMap: Record<string, string> = {};
    COLOR_ROLES.forEach(({ key }) => {
      const hsl = saved[key] || DEFAULT_THEME[key];
      hexMap[key] = hslToHex(hsl);
    });
    setThemeHex(hexMap);
  }, [settings.theme]);

  const handleColorChange = useCallback((key: string, hex: string) => {
    setThemeHex((prev) => ({ ...prev, [key]: hex }));
  }, []);

  const saveTheme = async () => {
    const hslMap: Record<string, string> = {};
    COLOR_ROLES.forEach(({ key }) => {
      if (themeHex[key]) hslMap[key] = hexToHsl(themeHex[key]);
    });
    await updateSetting("theme", hslMap);
    applyTheme(hslMap);
    toast({ title: "Theme saved", description: "Colors applied to your site." });
  };

  const resetTheme = async () => {
    const hexMap: Record<string, string> = {};
    COLOR_ROLES.forEach(({ key }) => { hexMap[key] = hslToHex(DEFAULT_THEME[key]); });
    setThemeHex(hexMap);
    await updateSetting("theme", DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
    toast({ title: "Theme reset", description: "Default colors restored." });
  };

  // Contact / Social / Legal
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [termsUrl, setTermsUrl] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await Promise.all([
        supabase.from("page_blocks" as any).delete().neq("id", "00000000-0000-0000-0000-000000000000"),
        supabase.from("site_settings" as any).delete().neq("key", ""),
        supabase.from("media_library" as any).delete().neq("id", "00000000-0000-0000-0000-000000000000"),
        supabase.from("site_content" as any).delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      ]);
      localStorage.removeItem("pebble_admin_auth");
      localStorage.removeItem("checklist_dismissed");
      toast({ title: "All data cleared", description: "Reloading..." });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast({ title: "Error clearing data", variant: "destructive" });
    }
    setClearing(false);
  };

  useEffect(() => {
    const c = settings.contact || {};
    setContactEmail(c.email || "");
    setContactPhone(c.phone || "");
    const s = settings.social || {};
    setInstagram(s.instagram || "");
    setFacebook(s.facebook || "");
    const l = settings.legal || {};
    setPrivacyUrl(l.privacy || "");
    setTermsUrl(l.terms || "");
  }, [settings]);

  const saveInfo = async () => {
    await Promise.all([
      updateSetting("contact", { email: contactEmail, phone: contactPhone }),
      updateSetting("social", { instagram, facebook }),
      updateSetting("legal", { privacy: privacyUrl, terms: termsUrl }),
    ]);
    toast({ title: "Settings saved" });
  };

  return (
    <div className="space-y-10">
      <h2 className="font-display text-xl font-bold text-foreground">Site Settings</h2>

      {/* LOGO */}
      <div className="space-y-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">Logo</p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Upload a PNG with transparent background. Recommended height: 40px. If no logo is set, your site name text shows instead.
          </p>
        </div>
        <div className="rounded border border-border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Preview */}
          <div className="w-full sm:w-48 h-16 rounded border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo preview" className="max-h-12 max-w-full object-contain" />
            ) : (
              <span className="font-body text-xs text-muted-foreground">No logo uploaded</span>
            )}
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="w-full sm:w-auto"
            >
              {logoUploading ? "Uploading..." : logoUrl ? "Replace Logo" : "Upload Logo"}
            </Button>
            {logoUrl && (
              <Button variant="outline" onClick={removeLogo} className="w-full sm:w-auto">
                Remove Logo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* THEME COLORS */}
      <div className="space-y-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">Theme Colors</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Click a swatch or type a hex code. Changes apply site-wide.</p>
        </div>
        <div className="flex rounded overflow-hidden border border-border h-6">
          {COLOR_ROLES.map(({ key, label }) => (
            <div key={key} className="flex-1" style={{ backgroundColor: themeHex[key] || "#ccc" }} title={label} />
          ))}
        </div>
        <div className="rounded border border-border bg-card px-4 py-1">
          {COLOR_ROLES.map(({ key, label, description }) => (
            <ColorRow key={key} label={label} description={description} hex={themeHex[key] || "#ffffff"} onChange={(hex) => handleColorChange(key, hex)} />
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={saveTheme}>Save Theme</Button>
          <Button variant="outline" onClick={resetTheme}>Reset to Default</Button>
        </div>
      </div>

      {/* CONTACT */}
      <div className="space-y-4">
        <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">Contact</p>
        <div className="grid gap-3">
          <div>
            <Label className="font-body text-xs">Email</Label>
            <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@yourbusiness.com" />
          </div>
          <div>
            <Label className="font-body text-xs">Phone</Label>
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+63 XXX XXX XXXX" />
          </div>
        </div>
      </div>

      {/* SOCIAL */}
      <div className="space-y-4">
        <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">Social Links</p>
        <div className="grid gap-3">
          <div>
            <Label className="font-body text-xs">Instagram</Label>
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourbusiness" />
          </div>
          <div>
            <Label className="font-body text-xs">Facebook</Label>
            <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="/yourbusiness" />
          </div>
        </div>
      </div>

      {/* LEGAL */}
      <div className="space-y-4">
        <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">Legal</p>
        <div className="grid gap-3">
          <div>
            <Label className="font-body text-xs">Privacy Policy URL</Label>
            <Input value={privacyUrl} onChange={(e) => setPrivacyUrl(e.target.value)} />
          </div>
          <div>
            <Label className="font-body text-xs">Terms URL</Label>
            <Input value={termsUrl} onChange={(e) => setTermsUrl(e.target.value)} />
          </div>
        </div>
      </div>

      <Button onClick={saveInfo}>Save Settings</Button>

      {/* DANGER ZONE */}
      <div className="space-y-4 pt-6 border-t border-destructive/30">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.15em] text-destructive">Danger Zone</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Clear all your site content and start fresh. This cannot be undone.</p>
        </div>
        {!confirmClear ? (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 w-full"
            onClick={() => setConfirmClear(true)}
          >
            🗑️ Clear All Site Data
          </Button>
        ) : (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3">
            <p className="font-body text-sm text-foreground font-medium">Are you sure? This will delete all your pages, blocks, and settings.</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={clearing}
                onClick={handleClearAll}
              >
                {clearing ? "Clearing..." : "Yes, clear everything"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteSettings;
