
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Users,
  BookOpen,
  BarChart2,
  HeadphonesIcon,
  Home,
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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Smart Scolarité</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild active={location.pathname === item.path}>
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
