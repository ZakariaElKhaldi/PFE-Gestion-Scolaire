// src/components/Navbar.tsx
import { cn } from "@/lib/utils";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { currentUser } from "@/types/lib/data";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-primary mr-8">
              SchoolHub
            </a>
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-700 hover:text-primary transition-colors duration-200"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-primary transition-colors duration-200"
              >
                Announcements
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-primary transition-colors duration-200"
              >
                Events
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-primary transition-colors duration-200"
              >
                Resources
              </a>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 px-4 py-2 pl-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 w-40 focus:w-64"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            </div>
            <button className="relative text-gray-700 hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-gray-500 capitalize">{currentUser.role}</span>
              </div>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
              />
            </div>
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center mb-6 border-b pb-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
              <div>
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-sm text-gray-500 capitalize">{currentUser.role}</div>
              </div>
            </div>
            <div className="space-y-4">
              <a
                href="#"
                className="block text-gray-700 hover:text-primary transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="block text-gray-700 hover:text-primary transition-colors"
              >
                Announcements
              </a>
              <a
                href="#"
                className="block text-gray-700 hover:text-primary transition-colors"
              >
                Events
              </a>
              <a
                href="#"
                className="block text-gray-700 hover:text-primary transition-colors"
              >
                Resources
              </a>
              <div className="pt-4 border-t">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-gray-100 px-4 py-2 pl-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 w-full"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <button className="flex items-center text-gray-700 hover:text-primary transition-colors w-full mt-4">
                <LogOut className="h-5 w-5 mr-2" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
