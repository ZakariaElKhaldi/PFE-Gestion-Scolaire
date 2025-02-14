import React, { useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Users,
  BookOpen,
  BarChart2,
  HeadphonesIcon,
  Home,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Accueil",
    icon: Home,
    path: "/",
  },
  {
    title: "Présences",
    icon: Users,
    path: "/attendance",
  },
  {
    title: "Devoirs",
    icon: BookOpen,
    path: "/assignments",
  },
  {
    title: "Performance",
    icon: BarChart2,
    path: "/performance",
  },
  {
    title: "Support",
    icon: HeadphonesIcon,
    path: "/support",
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <>
          <button className="p-2 text-white" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-blue-900" />}
          </button>
          {isOpen && (
            <div className="bg-gray-800 text-white w-64 h-full absolute top-0 left-0 z-50">
              <h2 className="text-lg font-semibold p-4">Menu</h2>
              <ul>
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className={`flex items-center gap-2 p-2 ${location.pathname === item.path ? 'bg-gray-700' : ''}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                className="absolute top-2 right-2"
                onClick={() => setIsOpen(false)}
                title="Close Menu"
              >
                <X className="h-6 w-6" />
              </button>

            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800 text-white w-64 h-full">
          <h2 className="text-lg font-semibold p-4">Menu</h2>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={`flex items-center gap-2 p-2 ${location.pathname === item.path ? 'bg-gray-700' : ''}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AppSidebar;
