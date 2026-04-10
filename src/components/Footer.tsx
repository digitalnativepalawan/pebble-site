import { Link } from "react-router-dom";
import { useBlocks } from "@/contexts/BlockContext";

const Footer = () => {
  const { settings } = useBlocks();
  const siteName = typeof settings?.site_name === "object" ? (settings.site_name?.text || "My Site") : (settings?.site_name || "My Site");
  const tagline = typeof settings?.tagline === "object" ? (settings.tagline?.text || "") : (settings?.tagline || "");

  return (
    <footer className="bg-background border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto text-center space-y-2">
        <p className="font-display text-lg font-bold text-primary">{siteName}</p>
        {tagline && <p className="font-body text-sm text-muted-foreground">{tagline}</p>}
        <p className="font-body text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
        <div className="pt-4">
          <Link
            to="/admin"
            className="font-body text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            Site Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
