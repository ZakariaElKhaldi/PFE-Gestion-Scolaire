import { ReactNode, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserResponse, UserRole } from '../../../types/auth'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../../components/ui/sidebar'
import { Separator } from '../../../components/ui/separator'
import { LogOut, Settings, User as UserIcon, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/badge'
import { authService } from '../../../services/auth.service'
import { getRoleDisplayName } from '../../../lib/auth-utils'

interface DashboardLayoutProps {
  children: ReactNode
  user: UserResponse | null
}

export const DashboardLayout = ({ children, user: propUser }: DashboardLayoutProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(propUser)
  const navigate = useNavigate()

  // Effect to load user from localStorage if not provided as prop
  useEffect(() => {
    // If user is provided as prop, use it
    if (propUser) {
      setUser(propUser)
      return
    }
    
    // Otherwise try to get from localStorage
    const storedUser = authService.getCurrentUser()
    if (storedUser) {
      console.log('User found in localStorage:', storedUser)
      setUser(storedUser)
    } else {
      console.log('No user found in localStorage, redirecting to login')
      navigate('/auth/sign-in')
    }
  }, [propUser, navigate])

  // Effect to validate authentication on component mount
  useEffect(() => {
    const validateAuth = async () => {
      const token = authService.getToken()
      if (!token) {
        console.log('No auth token found, redirecting to login')
        navigate('/auth/sign-in')
        return
      }
      
      // Additional validation if needed
    }
    
    validateAuth()
  }, [navigate])

  // If user is null, render a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-500 mt-2">Please wait while we retrieve your information</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    setIsLoading(true)
    // Clear auth data using the auth service
    authService.logout();
    toast.success('Logged out successfully')
    // Redirect to login page after a short delay
    setTimeout(() => {
      setIsLoading(false)
      navigate('/auth/sign-in')
    }, 1000)
  }

  const getRoleTitle = (role: UserRole) => {
    return getRoleDisplayName(role) + (role === 'administrator' ? ' Dashboard' : ' Portal')
  }

  const getUserInfo = () => {
    // Make sure user and user.role exist
    if (!user || !user.role) return 'User'

    switch (user.role) {
      case 'student':
        return `Student ID: ${user.studentId || 'ST-' + user.id}`
      case 'teacher':
        return `Teacher ID: ${user.teacherId || 'TCH-' + user.id}`
      case 'administrator':
        return 'Administrator'
      case 'parent':
        return `Parent ID: ${user.parentId || 'PR-' + user.id}`
      default:
        return user.email || 'User'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 z-10">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="font-semibold">{user && user.role ? getRoleTitle(user.role) : 'Dashboard'}</div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 relative">
            {/* Notifications */}
            <button 
              className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* User info and profile menu */}
            <div className="flex items-center relative">
              <div className="text-sm text-gray-500 mr-2 hidden sm:block">
                <div className="font-medium text-gray-900">{user.firstName || ''} {user.lastName || ''}</div>
                <div>{getUserInfo()}</div>
              </div>
              <button 
                className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {user.profilePicture ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.profilePicture}
                    alt=""
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.firstName?.[0] || ''}
                    {user.lastName?.[0] || ''}
                  </div>
                )}
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{user ? `${user.firstName || ''} ${user.lastName || ''}` : 'User'}</p>
                    <p className="text-xs text-gray-500">{getUserInfo()}</p>
                  </div>
                  <Link 
                    to={`/dashboard/${user?.role || 'student'}/profile`} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                  <Link 
                    to={`/dashboard/${user?.role || 'student'}/settings`} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button 
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}

              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Notifications</h3>
                      <Badge variant="outline" className="text-xs">3 new</Badge>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {/* Example notifications - replace with real data */}
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      <p className="text-sm font-medium">New assignment posted</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      <p className="text-sm font-medium">Grade updated</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <Link 
                      to={`/dashboard/${user.role || 'student'}/notifications`}
                      className="text-sm text-primary hover:text-primary/90"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 bg-gray-50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}