import { ReactNode, useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserResponse, UserRole, User } from '../../../types/auth'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../../components/ui/sidebar'
import { Separator } from '../../../components/ui/separator'
import { LogOut, Settings, User as UserIcon, Bell, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/badge'
import { authService } from '../../../services/auth.service'
import { getRoleDisplayName, checkStudentId } from '../../../lib/auth-utils'
import { LanguageSelector } from '../../../components/ui/language-selector'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  user: UserResponse | null
}

export const DashboardLayout = ({ children, user: propUser }: DashboardLayoutProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(propUser)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  
  // Page transition state
  const [isChangingRoute, setIsChangingRoute] = useState(false)
  const [prevPath, setPrevPath] = useState(location.pathname)
  const [transitionKey, setTransitionKey] = useState<number>(Date.now())

  // Use memo for repeated path comparisons
  const isNewPath = prevPath !== location.pathname

  // Handle route changes - optimize with useCallback
  const handleRouteChange = useCallback(() => {
    if (isNewPath) {
      // Route is changing, trigger transition
      setIsChangingRoute(true)
      
      // Generate a new transition key to properly handle content swapping
      setTransitionKey(Date.now())
      
      // After a short delay, complete the transition
      const timer = setTimeout(() => {
        setIsChangingRoute(false)
        setPrevPath(location.pathname)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [isNewPath, location.pathname, prevPath])

  // Apply route change effect
  useEffect(() => {
    handleRouteChange()
  }, [handleRouteChange, location.pathname])

  // Close dropdowns when route changes
  useEffect(() => {
    if (isNewPath) {
      setIsProfileMenuOpen(false)
      setIsNotificationsOpen(false)
    }
  }, [isNewPath, location.pathname])

  // Effect to load user from localStorage if not provided as prop
  useEffect(() => {
    const loadUser = async () => {
      try {
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
          setError('User session not found')
          // Delay redirect to show error message
          setTimeout(() => {
            navigate('/auth/sign-in')
          }, 1500)
        }
      } catch (err) {
        console.error('Error loading user data:', err)
        setError('Failed to load user data')
      }
    }
    
    loadUser()
  }, [propUser, navigate])

  // Effect to validate authentication on component mount
  useEffect(() => {
    const validateAuth = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          console.log('No auth token found, redirecting to login')
          setError('Authentication token not found')
          setTimeout(() => {
            navigate('/auth/sign-in')
          }, 1500)
          return
        }
        
        // Additional validation if needed
      } catch (err) {
        console.error('Auth validation error:', err)
        setError('Authentication validation failed')
      }
    }
    
    validateAuth()
  }, [navigate])

  // Apply studentId check for student users
  let enhancedUser = user;
  if (user && user.role === 'student') {
    enhancedUser = checkStudentId(user);
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-500 mb-6 text-center">
              There was a problem loading your dashboard. You will be redirected to the login page.
            </p>
            <button
              onClick={() => navigate('/auth/sign-in')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If user is null, render a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard</h2>
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

  const getRoleTitle = (role?: UserRole) => {
    if (!role) return 'Dashboard'
    return getRoleDisplayName(role) + (role === 'administrator' ? ' Dashboard' : ' Portal')
  }

  const getUserInfo = () => {
    // Make sure user and user.role exist
    if (!enhancedUser || !enhancedUser.role) return 'User'

    switch (enhancedUser.role) {
      case 'student':
        return `Student ID: ${enhancedUser.studentId || 'ST-' + enhancedUser.id}`
      case 'teacher':
        return `Teacher ID: ${enhancedUser.teacherId || 'TCH-' + enhancedUser.id}`
      case 'administrator':
        return 'Administrator'
      case 'parent':
        return `Parent ID: ${enhancedUser.parentId || 'PR-' + enhancedUser.id}`
      default:
        return enhancedUser.email || 'User'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={enhancedUser} />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 z-10">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="font-semibold">{enhancedUser && enhancedUser.role ? getRoleTitle(enhancedUser.role) : t('navigation.dashboard')}</div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 relative">
            {/* Language Selector */}
            <LanguageSelector className="mr-2" />
            
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
                <div className="font-medium text-gray-900">{enhancedUser?.firstName || ''} {enhancedUser?.lastName || ''}</div>
                <div>{getUserInfo()}</div>
              </div>
              <button 
                className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {enhancedUser?.profilePicture ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={enhancedUser.profilePicture}
                    alt=""
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {enhancedUser?.firstName?.[0] || ''}
                    {enhancedUser?.lastName?.[0] || ''}
                  </div>
                )}
              </button>

              {/* Profile dropdown menu - use popper or portals for better transitions */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{enhancedUser ? `${enhancedUser.firstName || ''} ${enhancedUser.lastName || ''}` : 'User'}</p>
                    <p className="text-xs text-gray-500">{getUserInfo()}</p>
                  </div>
                  <Link 
                    to={`/dashboard/${enhancedUser?.role || 'student'}/profile`} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                  <Link 
                    to={`/dashboard/${enhancedUser?.role || 'student'}/settings`} 
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

              {/* Notifications dropdown - use popper or portals for better transitions */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Notifications</h3>
                      <Badge variant="outline" className="text-xs">3 new</Badge>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {/* Notification entries would go here */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main content with improved transition effect */}
        <main className="flex-1 p-4 relative">
          {/* Use a key to force clean re-renders between routes */}
          <div
            key={transitionKey}
            className={cn(
              "route-transition-container",
              "transition-all duration-300 ease-in-out",
              isChangingRoute ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
            )}
          >
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}