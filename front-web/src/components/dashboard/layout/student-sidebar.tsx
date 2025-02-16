"use client"

import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  CreditCard, 
  Library,
  Award,
  Clock
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
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