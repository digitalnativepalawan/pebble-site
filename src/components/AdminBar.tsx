import { useAdmin } from "@/contexts/AdminContext";
import { Link } from "react-router-dom";

const AdminBar = () => {
  const { isAdminMode, toggleAdminMode, saving } = useAdmin();

  if (!isAdminMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-3 px-6">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-body text-xs tracking-wide uppercase">Admin Mode</span>
          {saving && <span className="font-body text-xs opacity-70 animate-pulse">Saving...</span>}
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="font-body text-xs opacity-70 hover:opacity-100 transition-opacity">
            Settings
          </Link>
          <button
            onClick={toggleAdminMode}
            className="font-body text-xs border border-primary-foreground/30 px-4 py-1.5 rounded-full hover:bg-primary-foreground/10 transition-colors"
          >
            Disable
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBar;
