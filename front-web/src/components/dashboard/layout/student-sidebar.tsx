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
  ClipboardCheck,
  HelpCircle,
  Calendar,
  MessageSquare,
  Bell,
  ThumbsUp,
  UserRound,
  Settings
} from "lucide-react"
import { Link, useLocation } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
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
    title: "Assignments",
    icon: ClipboardCheck,
    href: "/dashboard/student/assignments",
  },
  {
    title: "Grades",
    icon: GraduationCap,
    href: "/dashboard/student/grades",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/dashboard/student/schedule",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/dashboard/student/attendance",
  },
  {
    title: "Digital Library",
    icon: Library,
    href: "/dashboard/student/library",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/dashboard/student/documents",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/dashboard/student/messages",
  },
  {
    title: "Forum",
    icon: MessageSquare,
    href: "/dashboard/student/forum",
  },
  {
    title: "Feedback",
    icon: ThumbsUp,
    href: "/dashboard/student/feedback",
  },
  {
    title: "Certificates",
    icon: Award,
    href: "/dashboard/student/certificates",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/student/payments",
  },
  {
    title: "Support",
    icon: HelpCircle,
    href: "/dashboard/student/support",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/student/notifications",
  },
  {
    title: "Profile",
    icon: UserRound,
    href: "/dashboard/student/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/student/settings",
  }
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
                <SidebarMenuItem 
                  key={item.title}
                  href={item.href}
                  icon={<item.icon />}
                  active={location.pathname === item.href}
                >
                  {item.title}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}