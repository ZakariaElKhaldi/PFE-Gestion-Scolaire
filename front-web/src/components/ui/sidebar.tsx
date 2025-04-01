"use client"

import * as React from "react"
import { Link as RouterLink } from "react-router-dom"
import { cn } from "../../lib/utils"

interface SidebarContextValue {
  isOpen: boolean
  toggle: () => void
  isRTL: boolean
}

const SidebarContext = React.createContext<SidebarContextValue>({
  isOpen: true,
  toggle: () => {},
  isRTL: false,
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isRTL, setIsRTL] = React.useState(document.documentElement.dir === 'rtl')
  
  React.useEffect(() => {
    const handleDirectionChange = () => {
      setIsRTL(document.documentElement.dir === 'rtl')
    }
    
    window.addEventListener('directionchange', handleDirectionChange)
    
    const handleDirChange = () => {
      setTimeout(() => setIsOpen(true), 50)
    }
    window.addEventListener('directionchange', handleDirChange)
    
    setIsRTL(document.documentElement.dir === 'rtl')
    
    return () => {
      window.removeEventListener('directionchange', handleDirectionChange)
      window.removeEventListener('directionchange', handleDirChange)
    }
  }, [])
  
  return (
    <SidebarContext.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen), isRTL }}>
      <div className="flex min-h-screen bg-gray-50">{children}</div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, isRTL } = React.useContext(SidebarContext)
  
  const sidebarStyle = React.useMemo(() => {
    const baseClasses = "fixed inset-y-0 z-50 flex w-64 flex-col border bg-white shadow-sm transition-all duration-300 will-change-transform"
    
    if (isRTL) {
      return cn(
        baseClasses,
        "right-0 left-auto border-l border-r-0",
        !isOpen && "translate-x-full"
      )
    }
    
    return cn(
      baseClasses,
      "left-0 right-auto border-r border-l-0",
      !isOpen && "-translate-x-full"
    )
  }, [isOpen, isRTL])
  
  React.useEffect(() => {
    const sidebar = document.querySelector('aside')
    if (sidebar) {
      sidebar.style.transition = 'none'
      void sidebar.offsetHeight
      requestAnimationFrame(() => {
        sidebar.style.transition = 'all 0.3s'
      })
    }
  }, [isRTL])
  
  return (
    <aside className={sidebarStyle}>
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold text-gray-900">EduManage</span>
      </div>
      {children}
    </aside>
  )
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle, isRTL } = React.useContext(SidebarContext)
  return (
    <button
      className={cn("text-gray-500 hover:text-gray-600", className)}
      onClick={toggle}
    >
      <svg 
        className={cn("h-6 w-6", isRTL && "transform rotate-180")} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  const { isOpen, isRTL } = React.useContext(SidebarContext)
  
  const insetStyle = React.useMemo(() => {
    const baseClasses = "flex flex-1 flex-col transition-all duration-300 ease-in-out"
    
    if (isRTL) {
      return cn(baseClasses, isOpen ? "mr-64" : "mr-0")
    }
    
    return cn(baseClasses, isOpen ? "ml-64" : "ml-0")
  }, [isOpen, isRTL])
  
  return (
    <div className={insetStyle}>
      {children}
    </div>
  )
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col overflow-auto py-2">{children}</div>
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-2">{children}</div>
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  const { isRTL } = React.useContext(SidebarContext)
  return <div className={cn("mb-2 px-2 text-xs font-semibold text-gray-500", isRTL && "text-right")}>{children}</div>
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <nav className="space-y-1">{children}</nav>
}

export function SidebarMenuItem({
  children,
  href,
  icon,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  href?: string
  icon?: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  const { isRTL } = React.useContext(SidebarContext)
  
  const activeStyles = active
    ? "bg-gray-100 text-black"
    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  
  const itemStyles = cn(
    "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium",
    activeStyles,
    isRTL && "flex-row-reverse text-right justify-end"
  )
  
  const iconStyles = cn(
    "h-5 w-5 flex-shrink-0",
    isRTL ? "ml-2" : "mr-2",
    active ? "text-black" : "text-gray-500 group-hover:text-gray-500"
  )
  
  if (href) {
    return (
      <RouterLink
        to={href}
        className={itemStyles}
        onClick={onClick}
      >
        {icon && (
          <span className={iconStyles}>{icon}</span>
        )}
        <span className="flex-1">{children}</span>
      </RouterLink>
    );
  }
  
  return (
    <button
      className={itemStyles}
      onClick={onClick}
    >
      {icon && (
        <span className={iconStyles}>{icon}</span>
      )}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function SidebarMenuButton({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
}) {
  const { isRTL } = React.useContext(SidebarContext)
  
  return (
    <button
      className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      onClick={onClick}
    >
      {icon && (
        <span className={cn("mr-3 h-6 w-6 text-gray-500", isRTL && "ml-3 mr-0")}>{icon}</span>
      )}
      {children}
    </button>
  )
}