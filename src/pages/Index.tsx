import Navbar from "@/components/Navbar";
import BlockRenderer from "@/components/BlockRenderer";
import Footer from "@/components/Footer";
import AdminBar from "@/components/AdminBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <BlockRenderer pageSlug="home" />
      <Footer />
      <AdminBar />
    </div>
  );
};

export default Index;
