import { useBlocks } from "@/contexts/BlockContext";

const Footer = () => {
  const { settings } = useBlocks();
  const siteName = settings?.site_name || "My Site";
  const tagline = settings?.tagline || "";

  return (
    <footer className="bg-background border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto text-center space-y-2">
        <p className="font-display text-lg font-bold text-primary">{siteName}</p>
        {tagline && <p className="font-body text-sm text-muted-foreground">{tagline}</p>}
        <p className="font-body text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
