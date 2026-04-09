import { useBlocks } from "@/contexts/BlockContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { settings } = useBlocks();
  const siteName = typeof settings?.site_name === "object" ? (settings.site_name?.text || "My Site") : (settings?.site_name || "My Site");
  const logo = settings?.logo_url;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-display text-lg font-bold text-primary">{siteName}</span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
