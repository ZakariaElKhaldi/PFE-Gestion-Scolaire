"use client"

import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  CreditCard, 
  Library,
  Award,
  Clock,
  ClipboardCheck, // Import the icon for assignments
  HelpCircle, // Import the icon for support
  Calendar, // Import the icon for schedule
  MessageSquare // Import the icon for forum
} from "lucide-react"
import { Link, useLocation } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../components/ui/sidebar"

const navigation = [
  {
    title: "Overview",
    icon: Home,
    href: "/dashboard/student",
  },
  {
    title: "My Courses",
    icon: GraduationCap,
    href: "/dashboard/student/courses",
  },
  {
    title: "Course Materials",
    icon: BookOpen,
    href: "/dashboard/student/materials",
  },
  {
    title: "Digital Library",
    icon: Library,
    href: "/dashboard/student/library",
  },
  {
    title: "Certificates",
    icon: Award,
    href: "/dashboard/student/certificates",
  },
  {
    title: "Forum",
    icon: MessageSquare,
    href: "/dashboard/shared/forum",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/dashboard/student/attendance",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/student/payments",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/dashboard/student/documents",
  },
  {
    title: "Assignments",
    icon: ClipboardCheck,
    href: "/dashboard/student/assignments",
  },
  {
    title: "Support et Assistance", // Add the new navigation item
    icon: HelpCircle,
    href: "/dashboard/student/support",
  },
  {
    title: "Schedule", // Add the new navigation item
    icon: Calendar,
    href: "/dashboard/student/schedule",
  },
  {
    title: "Grades", // Add the new navigation item
    icon: GraduationCap,
    href: "/dashboard/student/grades",
  },
]

export function StudentSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={location.pathname === item.href}>
                    <Link to={item.href} className="flex items-center">
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}