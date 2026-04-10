import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Globe, Plus, Layout, Image, Settings, Rocket } from "lucide-react";
import AdminLogin from "@/components/admin/AdminLogin";
import LaunchTab from "@/components/admin/LaunchTab";
import BlockList from "@/components/admin/BlockList";
import AddBlockModal from "@/components/admin/AddBlockModal";
import TextBlockEditor from "@/components/admin/TextBlockEditor";
import TableBlockEditor from "@/components/admin/TableBlockEditor";
import NumbersBlockEditor from "@/components/admin/NumbersBlockEditor";
import StatsBlockEditor from "@/components/admin/StatsBlockEditor";
import ImageBlockEditor from "@/components/admin/ImageBlockEditor";
import VideoBlockEditor from "@/components/admin/VideoBlockEditor";
import ListBlockEditor from "@/components/admin/ListBlockEditor";
import TimelineBlockEditor from "@/components/admin/TimelineBlockEditor";
import FAQBlockEditor from "@/components/admin/FAQBlockEditor";
import ColumnsBlockEditor from "@/components/admin/ColumnsBlockEditor";
import MediaLibrary from "@/components/admin/MediaLibrary";
import SiteSettings from "@/components/admin/SiteSettings";
import SiteChecklist from "@/components/admin/SiteChecklist";

const AdminDashboard = () => {
  const { pages, loading, createBlock, settings, getBlocksForPage } = useBlocks();
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("pebble_admin_auth") === "true");
  const [selectedPage, setSelectedPage] = useState("home");
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [showNewPage, setShowNewPage] = useState(false);

  if (!authenticated) return <AdminLogin onAuthenticated={() => setAuthenticated(true)} />;

  const siteName = typeof settings?.site_name === "object"
    ? (settings.site_name?.text || "My Site")
    : (settings?.site_name || "My Site");

  const allPages = [...new Set(["home", ...pages])];

  const handleAddPage = async () => {
    if (!newPageName.trim()) return;
    const slug = newPageName.toLowerCase().replace(/\s+/g, "-");
    await createBlock(slug, "text", { heading: newPageName, body: "" });
    setSelectedPage(slug);
    setNewPageName("");
    setShowNewPage(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("pebble_admin_auth");
    setAuthenticated(false);
  };

  const editorForBlock = (block: PageBlock) => {
    const props = { block, open: true, onClose: () => setEditingBlock(null) };
    switch (block.block_type) {
      case "text": case "hero": return <TextBlockEditor {...props} />;
      case "table": return <TableBlockEditor {...props} />;
      case "numbers": return <NumbersBlockEditor {...props} />;
      case "stats": return <StatsBlockEditor {...props} />;
      case "image": return <ImageBlockEditor {...props} />;
      case "video": return <VideoBlockEditor {...props} />;
      case "list": return <ListBlockEditor {...props} />;
      case "timeline": return <TimelineBlockEditor {...props} />;
      case "faq": return <FAQBlockEditor {...props} />;
      case "columns": return <ColumnsBlockEditor {...props} />;
      default: return <TextBlockEditor {...props} />;
    }
  };

  const homeBlocks = getBlocksForPage("home");
  const isNewSite = homeBlocks.length === 0;

  return (
    <div className="min-h-screen bg-background">

      {/* Top bar */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-display text-sm font-bold text-primary">
                {siteName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground leading-none">{siteName}</p>
              <p className="font-body text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5 font-body text-xs">
                <Globe className="w-3.5 h-3.5" /> View Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 font-body text-xs text-muted-foreground">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <Tabs defaultValue="pages">
          <TabsList className="mb-6 h-auto p-1 gap-1">
            <TabsTrigger value="pages" className="gap-1.5 font-body text-xs">
              <Layout className="w-3.5 h-3.5" /> Pages
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1.5 font-body text-xs">
              <Image className="w-3.5 h-3.5" /> Photos
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 font-body text-xs">
              <Settings className="w-3.5 h-3.5" /> Settings
            </TabsTrigger>
            <TabsTrigger value="launch" className="gap-1.5 font-body text-xs">
              <Rocket className="w-3.5 h-3.5" /> Launch Sites
            </TabsTrigger>
          </TabsList>

          {/* PAGES TAB */}
          <TabsContent value="pages">
            {isNewSite && !loading ? (
              /* Empty state for brand new sites */
              <div className="text-center py-16 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Layout className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Let's build your site</h2>
                  <p className="font-body text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                    Start by adding your first section. We recommend beginning with a cover photo and your business name.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                  {[
                    { emoji: "🖼️", title: "Cover / Banner", desc: "Your main photo and headline" },
                    { emoji: "✍️", title: "About Section", desc: "Tell your story" },
                    { emoji: "💰", title: "Prices / Menu", desc: "Show what you offer" },
                  ].map(s => (
                    <button key={s.title} onClick={() => setShowAddModal(true)}
                      className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left">
                      <div className="text-2xl mb-2">{s.emoji}</div>
                      <p className="font-body text-sm font-medium text-foreground">{s.title}</p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={() => setShowAddModal(true)} className="font-display tracking-wider">
                  + Add First Section
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
                {/* Page sidebar */}
                <div className="space-y-1">
                  <p className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Pages</p>
                  {allPages.map(page => (
                    <button key={page} onClick={() => setSelectedPage(page)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                        selectedPage === page
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}>
                      {page === "home" ? "🏠 Home" : page.charAt(0).toUpperCase() + page.slice(1)}
                    </button>
                  ))}
                  <div className="pt-2 border-t border-border mt-2">
                    {showNewPage ? (
                      <div className="space-y-2">
                        <Input value={newPageName} onChange={e => setNewPageName(e.target.value)}
                          placeholder="e.g. About, Menu, Rooms"
                          className="h-8 text-sm"
                          onKeyDown={e => e.key === "Enter" && handleAddPage()}
                          autoFocus />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleAddPage} className="flex-1 h-7 text-xs">Add</Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowNewPage(false)} className="h-7 text-xs">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowNewPage(true)}
                        className="w-full text-left px-3 py-2 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add page
                      </button>
                    )}
                  </div>
                </div>

                {/* Block editor */}
                <div>
                  {loading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
                    </div>
                  ) : (
                    <>
                      {selectedPage === "home" && (
                        <SiteChecklist onAddBlock={() => setShowAddModal(true)} />
                      )}
                      <BlockList pageSlug={selectedPage} onEdit={setEditingBlock} onAdd={() => setShowAddModal(true)} />
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* MEDIA TAB */}
          <TabsContent value="media">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">Photo Library</h2>
                <p className="font-body text-sm text-muted-foreground mt-0.5">
                  Upload photos here to use across your site. Once uploaded, you can pick them from any image block.
                </p>
              </div>
              <MediaLibrary />
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">Site Settings</h2>
                <p className="font-body text-sm text-muted-foreground mt-0.5">
                  Update your business name, colors, contact info, and more.
                </p>
              </div>
              <SiteSettings />
            </div>
          </TabsContent>

          {/* LAUNCH TAB */}
          <TabsContent value="launch">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">Launch a New Client Site</h2>
                <p className="font-body text-sm text-muted-foreground mt-0.5">
                  Palawan Collective internal tool — creates a new Supabase + Vercel site automatically.
                </p>
              </div>
              <LaunchTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {editingBlock && editorForBlock(editingBlock)}
      <AddBlockModal open={showAddModal} onClose={() => setShowAddModal(false)} pageSlug={selectedPage} />
    </div>
  );
};

export default AdminDashboard;
