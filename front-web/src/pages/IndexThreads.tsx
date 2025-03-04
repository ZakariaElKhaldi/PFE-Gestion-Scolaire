// src/pages/Index.tsx
import Navbar from "@/components/Threads/Nabvar";
import Feed from "@/components/Threads/Feed";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Feed />
      </div>
    </div>
  );
};

export default Index;

