import { useAdmin } from "@/contexts/AdminContext";
import { Link } from "react-router-dom";

const Admin = () => {
  const { isAdminMode, toggleAdminMode, saving } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-6 py-20">
        <h1 className="font-display text-3xl font-bold text-primary uppercase tracking-[0.1em] mb-2">
          AMUMA Admin
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-12">Content management</p>

        <div className="space-y-10">
          {/* Toggle */}
          <div className="flex items-center justify-between border-b border-border pb-8">
            <div>
              <p className="font-body text-base text-foreground mb-1">Admin Edit Mode</p>
              <p className="font-body text-sm text-muted-foreground">
                {isAdminMode ? "Enabled — edit content on the homepage" : "Disabled"}
              </p>
            </div>
            <button
              onClick={toggleAdminMode}
              className={`px-6 py-3 rounded-full font-body text-sm tracking-wide transition-all duration-300 ${
                isAdminMode
                  ? "bg-primary text-primary-foreground"
                  : "border border-primary text-primary hover:bg-primary/5"
              }`}
            >
              {isAdminMode ? "Disable" : "Enable Admin Edit Mode"}
            </button>
          </div>

          {/* Status */}
          {saving && (
            <p className="font-body text-sm text-muted-foreground animate-pulse">Saving changes...</p>
          )}

          {/* Instructions */}
          <div className="space-y-4">
            <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">
              How it works
            </p>
            <div className="space-y-3 font-body text-base text-foreground/70 leading-relaxed">
              <p>— Enable admin mode above</p>
              <p>— Navigate to the homepage</p>
              <p>— Click any text to edit it inline</p>
              <p>— Hover over image areas to upload or replace images</p>
              <p>— All changes save automatically to the database</p>
            </div>
          </div>

          <div className="divider" />

          {/* Capabilities */}
          <div className="space-y-4">
            <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Capabilities
            </p>
            <div className="space-y-3 font-body text-base text-foreground/70 leading-relaxed">
              <p>— Upload images to any section</p>
              <p>— Replace hero and destination images</p>
              <p>— Edit all text content</p>
              <p>— Changes persist across sessions</p>
            </div>
          </div>

          <div className="divider" />

          <Link
            to="/"
            className="inline-block font-body text-sm text-primary border-b border-primary/30 hover:border-primary transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Admin;
