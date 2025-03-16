"use client"

import { Home, Users, Settings, BookOpen, Bell, Calendar, BookText, FileText, BarChart, LucideIcon, BookCopy, GraduationCap, PenSquare, Mail, FileCheck, CreditCard, HelpCircle, MessageSquare } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { User as UserType } from "../../../types/auth"

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

type NavigationItem = {
  title: string
  icon: LucideIcon
  href: string
}

const adminNavigation: NavigationItem[] = [
  // Main
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard/admin",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/admin/users",
  },
  
  // Academic Management
  {
    title: "Classes",
    icon: BookOpen,
    href: "/dashboard/admin/classes",
  },
  {
    title: "Courses",
    icon: BookText,
    href: "/dashboard/admin/courses",
  },
  {
    title: "Departments",
    icon: BookOpen,
    href: "/dashboard/admin/departments",
  },
  {
    title: "Events",
    icon: Calendar,
    href: "/dashboard/admin/events",
  },
  
  // Analytics & Reports
  {
    title: "Analytics",
    icon: BarChart,
    href: "/dashboard/admin/analytics",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/dashboard/admin/reports",
  },
  {
    title: "Finance",
    icon: CreditCard,
    href: "/dashboard/admin/finance",
  },
  
  // Communication
  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/admin/notifications",
  },
  {
    title: "Forum",
    icon: MessageSquare,
    href: "/dashboard/admin/forum",
  },
  
  // System & Configuration
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/admin/settings",
  },
  {
    title: "Contact & Support",
    icon: HelpCircle,
    href: "/dashboard/admin/contact",
  },
]

const teacherNavigation: NavigationItem[] = [
  // Main Navigation
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard/teacher",
  },
  {
    title: "Classes",
    icon: BookOpen,
    href: "/dashboard/teacher/classes",
  },
  {
    title: "Students",
    icon: Users,
    href: "/dashboard/teacher/students",
  },
  
  // Teaching Tools
  {
    title: "Materials",
    icon: BookCopy,
    href: "/dashboard/teacher/materials",
  },
  {
    title: "Curriculum",
    icon: BookOpen,
    href: "/dashboard/teacher/curriculum",
  },
  {
    title: "Assignments",
    icon: PenSquare,
    href: "/dashboard/teacher/assignments",
  },
  {
    title: "Grading",
    icon: PenSquare,
    href: "/dashboard/teacher/grading",
  },
  {
    title: "Grades",
    icon: BookText,
    href: "/dashboard/teacher/grades",
  },
  {
    title: "Attendance",
    icon: FileCheck,
    href: "/dashboard/teacher/attendance",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/dashboard/teacher/documents",
  },
  
  // Calendar & Schedule
  {
    title: "Calendar",
    icon: Calendar,
    href: "/dashboard/teacher/calendar",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/dashboard/teacher/schedule",
  },
  
  // Analytics & Reports
  {
    title: "Analytics",
    icon: BarChart,
    href: "/dashboard/teacher/analytics",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/dashboard/teacher/reports",
  },
  
  // Communication
  {
    title: "Messages",
    icon: Mail,
    href: "/dashboard/teacher/messages",
  },
  {
    title: "Feedback",
    icon: MessageSquare,
    href: "/dashboard/teacher/feedback",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/teacher/notifications",
  },
  {
    title: "Forum",
    icon: MessageSquare,
    href: "/dashboard/teacher/forum",
  },
  
  // Profile & Settings
  {
    title: "Profile",
    icon: Users,
    href: "/dashboard/teacher/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/teacher/settings",
  },
  {
    title: "Contact & Support",
    icon: HelpCircle,
    href: "/dashboard/teacher/contact",
  },
]

const studentNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard/student",
  },
  {
    title: "Courses",
    icon: BookOpen,
    href: "/dashboard/student/courses",
  },
  {
    title: "Materials",
    icon: BookCopy,
    href: "/dashboard/student/materials",
  },
  {
    title: "Library",
    icon: BookText,
    href: "/dashboard/student/library",
  },
  {
    title: "Certificates",
    icon: GraduationCap,
    href: "/dashboard/student/certificates",
  },
  {
    title: "Attendance",
    icon: FileCheck,
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
    icon: PenSquare,
    href: "/dashboard/student/assignments",
  },
  {
    title: "Support",
    icon: HelpCircle,
    href: "/dashboard/student/support",
  },
  {
    title: "Feedback",
    icon: MessageSquare,
    href: "/dashboard/student/feedback",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/dashboard/student/schedule",
  },
  {
    title: "Grades",
    icon: BookText,
    href: "/dashboard/student/grades",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/student/notifications",
  },
  {
    title: "Profile",
    icon: Users,
    href: "/dashboard/student/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/student/settings",
  },
  {
    title: "Contact & Support",
    icon: HelpCircle,
    href: "/dashboard/student/contact",
  },
  {
    title: "Forum",
    icon: MessageSquare,
    href: "/dashboard/student/forum",
  },
]

const parentNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard/parent",
  },
  {
    title: "Children",
    icon: Users,
    href: "/dashboard/parent/children",
  },
  {
    title: "Grades",
    icon: BookText,
    href: "/dashboard/parent/grades",
  },
  {
    title: "Attendance",
    icon: FileCheck,
    href: "/dashboard/parent/attendance",
  },
  {
    title: "Progress",
    icon: BarChart,
    href: "/dashboard/parent/progress",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/dashboard/parent/schedule",
  },
  {
    title: "Monitoring",
    icon: BarChart,
    href: "/dashboard/parent/monitoring",
  },
  {
    title: "Messages",
    icon: Mail,
    href: "/dashboard/parent/messages",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/parent/payments",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/dashboard/parent/documents",
  },
  {
    title: "Feedback",
    icon: MessageSquare,
    href: "/dashboard/parent/feedback",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/parent/notifications",
  },
  {
    title: "Profile",
    icon: Users,
    href: "/dashboard/parent/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/parent/settings",
  },
  {
    title: "Contact & Support",
    icon: HelpCircle,
    href: "/dashboard/parent/contact",
  },
  {
    title: "Forum",
    icon: MessageSquare,
    href: "/dashboard/parent/forum",
  },
]

interface AppSidebarProps {
  user: UserType | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const location = useLocation()
  
  const getNavigationByRole = () => {
    switch (user?.role) {
      case 'administrator':
        return adminNavigation
      case 'teacher':
        return teacherNavigation
      case 'student':
        return studentNavigation
      case 'parent':
        return parentNavigation
      default:
        return studentNavigation // Default to student navigation if no role is found
    }
  }

  const navigation = getNavigationByRole()

  // Group definitions for teacher navigation
  const teacherNavigationGroups = [
    { label: "Main", items: teacherNavigation.slice(0, 3) },
    { label: "Teaching", items: teacherNavigation.slice(3, 10) },
    { label: "Schedule", items: teacherNavigation.slice(10, 12) },
    { label: "Analysis", items: teacherNavigation.slice(12, 14) },
    { label: "Communication", items: teacherNavigation.slice(14, 18) },
    { label: "Personal", items: teacherNavigation.slice(18, 21) }
  ]
  
  // Group definitions for admin navigation
  const adminNavigationGroups = [
    { label: "Main", items: adminNavigation.slice(0, 2) },
    { label: "Academic", items: adminNavigation.slice(2, 7) },
    { label: "Analytics", items: adminNavigation.slice(7, 10) },
    { label: "Communication", items: adminNavigation.slice(10, 12) },
    { label: "System", items: adminNavigation.slice(12, 15) }
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{(user?.role || 'User').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)} Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* For teacher role, display grouped navigation */}
            {user?.role === 'teacher' ? (
              <>
                {teacherNavigationGroups.map((group, index) => (
                  <div key={index} className="mb-4">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-500">{group.label}</div>
                    <SidebarMenu>
                      {group.items.map((item) => (
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
                  </div>
                ))}
              </>
            ) : user?.role === 'administrator' ? (
              <>
                {adminNavigationGroups.map((group, index) => (
                  <div key={index} className="mb-4">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-500">{group.label}</div>
                    <SidebarMenu>
                      {group.items.map((item) => (
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
                  </div>
                ))}
              </>
            ) : (
              // Standard navigation for other roles
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
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Quick access to debug navigation */}
        <div className="mt-6">
          <SidebarGroup>
            <SidebarGroupLabel>Development</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/debug'}>
                    <Link to="/debug" className="flex items-center text-amber-600">
                      <HelpCircle className="h-5 w-5" />
                      <span className="ml-3">Debug Navigation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}