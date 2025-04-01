import { 
  GraduationCap, 
  Users, 
  ClipboardCheck, 
  MessageSquare,
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
  ChevronRight,
  Backpack,
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  WifiOff
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { User } from "../../../types/auth"
import { DashboardLayout } from "../../../components/dashboard/layout/dashboard-layout"
import { teacherService } from "../../../services/teacher-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Progress } from "../../../components/ui/progress"
import { Button } from "../../../components/ui/button"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import { toast } from "react-hot-toast"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"

// Create a simple Skeleton component since we don't have the UI one
const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
);

interface TeacherDashboardProps {
  user: User
}

// Interfaces for data types
interface TeacherDashboardStats {
  classes: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
  students: {
    total: number;
    averageAttendance: number;
    averagePerformance: number;
  };
  assignments: {
    total: number;
    pending: number;
    graded: number;
    upcoming: number;
  };
  attendance: {
    today: {
      present: number;
      absent: number;
      late: number;
      total: number;
    };
    weekly: {
      present: number;
      absent: number;
      late: number;
      total: number;
    };
  };
  recentActivity: Array<{
    id: string;
    type: 'submission' | 'grade' | 'feedback' | 'material';
    title: string;
    description: string;
    timestamp: string;
    studentName?: string;
    courseName?: string;
  }>;
}

interface ClassScheduleItem {
  classId: string;
  className: string;
  courseName: string;
  room: string;
  startTime: string;
  endTime: string;
  studentCount: number;
}

// Type for the schedule API response which may have optional time fields
interface ScheduleResponse {
  classId: string;
  className: string;
  courseName: string;
  room: string;
  startTime?: string;
  endTime?: string;
  studentCount: number;
}

const features = [
  {
    name: "My Classes",
    description: "Manage your classes and course schedules",
    icon: GraduationCap,
    href: "/dashboard/teacher/classes",
    color: "bg-blue-500",
  },
  {
    name: "Students",
    description: "View and manage student information",
    icon: Users,
    href: "/dashboard/teacher/students",
    color: "bg-green-500",
  },
  {
    name: "Assignments",
    description: "Create and grade assignments",
    icon: ClipboardCheck,
    href: "/dashboard/teacher/assignments",
    color: "bg-purple-500",
  },
  {
    name: "Messages",
    description: "Communicate with students and staff",
    icon: MessageSquare,
    href: "/dashboard/teacher/messages",
    color: "bg-yellow-500",
  },
]

// Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  } catch {
    return 'Invalid date';
  }
};

// Get activity icon based on type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'submission':
      return <Backpack className="h-4 w-4 text-blue-600" />;
    case 'grade':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'feedback':
      return <MessageSquare className="h-4 w-4 text-yellow-600" />;
    case 'material':
      return <BookOpen className="h-4 w-4 text-purple-600" />;
    default:
      return <ArrowRight className="h-4 w-4 text-gray-600" />;
  }
};

const TeacherDashboard = ({ user }: TeacherDashboardProps) => {
  const [dashboardStats, setDashboardStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [todayClasses, setTodayClasses] = useState<ClassScheduleItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Get current day of week
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Check API connection status
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await teacherService.checkApiConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch (err) {
      setConnectionStatus('disconnected');
    }
  };

  // Fetch dashboard data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check connection status first
        await checkConnection();
        
        // Get dashboard stats
        const stats = await teacherService.getDashboardStats();
        setDashboardStats(stats);

        // Get today's schedule
        const currentDay = getCurrentDay();
        const schedule = await teacherService.getScheduleByDay(currentDay) as ScheduleResponse[];

        // Sort schedule by start time and filter out items without start time
        const validScheduleItems = schedule
          .filter(item => item.startTime && item.endTime)
          .map(item => ({
            ...item,
            startTime: item.startTime as string,
            endTime: item.endTime as string
          }))
          .sort((a, b) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
          });
        
        setTodayClasses(validScheduleItems);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.message || 'Failed to fetch dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Reset states
    setError(null);
    
    // Use the same fetch function as in useEffect
    const fetchDashboardData = async () => {
      try {
        // Check connection status first
        await checkConnection();
        
        // Get dashboard stats
        const stats = await teacherService.getDashboardStats();
        setDashboardStats(stats);

        // Get today's schedule
        const currentDay = getCurrentDay();
        const schedule = await teacherService.getScheduleByDay(currentDay) as ScheduleResponse[];

        // Sort schedule by start time and filter out items without start time
        const validScheduleItems = schedule
          .filter(item => item.startTime && item.endTime)
          .map(item => ({
            ...item,
            startTime: item.startTime as string,
            endTime: item.endTime as string
          }))
          .sort((a, b) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
          });
        
        setTodayClasses(validScheduleItems);
        toast.success('Dashboard refreshed successfully');
      } catch (error: any) {
        console.error('Failed to refresh dashboard data:', error);
        setError(error.message || 'Failed to refresh dashboard data. Please try again later.');
        toast.error('Failed to refresh dashboard data');
      } finally {
        setRefreshing(false);
      }
    };
    
    fetchDashboardData();
  };

  // Format time for display (e.g., "09:00" to "9:00 AM")
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time;
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Teacher'}!</h1>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening with your classes today.</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection status indicator */}
            <div className="flex items-center">
              {connectionStatus === 'connected' ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3" />
                  <span>Connected to API</span>
                </Badge>
              ) : connectionStatus === 'disconnected' ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
                  <WifiOff className="h-3 w-3" />
                  <span>Using mock data</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Checking connection</span>
                </Badge>
              )}
            </div>
            {/* Refresh button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing || loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.attendance.today.present}/{dashboardStats?.attendance.today.total}
                </div>
                <Progress 
                  value={(dashboardStats?.attendance.today.present / dashboardStats?.attendance.today.total) * 100 || 0} 
                  className="h-2 mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {dashboardStats?.attendance.today.absent} absent, {dashboardStats?.attendance.today.late} late
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.classes.active}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs text-gray-500">
                    {dashboardStats?.classes.total} total
                  </div>
                  <span className="text-xs text-gray-300">•</span>
                  <div className="text-xs text-gray-500">
                    {todayClasses.length} today
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.assignments.pending}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    {dashboardStats?.assignments.upcoming} upcoming
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {dashboardStats?.assignments.graded} graded
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.students.total}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <BarChart3 className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-gray-500">
                      {dashboardStats?.students.averagePerformance}% avg. performance
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main dashboard content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>
                  {getCurrentDay()}'s classes and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : todayClasses.length > 0 ? (
                  <div className="space-y-4">
                    {todayClasses.map((cls) => (
                      <div key={cls.classId} className="flex items-start border-b pb-4 last:border-0">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                          {formatTime(cls.startTime).split(' ')[0]}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="font-medium">{cls.className}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatTime(cls.startTime)} - {formatTime(cls.endTime)} • {cls.room}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {cls.studentCount} students
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No classes today</h3>
                    <p className="mt-1 text-sm text-gray-500">Enjoy your day off or catch up on grading.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/dashboard/teacher/schedule">View Full Schedule</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your classes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-b pb-4 last:border-0">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : dashboardStats?.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.recentActivity.map((activity: any) => (
                      <div key={activity.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="font-medium text-sm">{activity.title}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(activity.timestamp)}
                          {activity.courseName && ` • ${activity.courseName}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-gray-500">New activities will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.href}
                      className="flex items-center p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
                      <span className={`inline-flex p-2 rounded-md ${feature.color} text-white mr-3`}>
                        <feature.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
              <div>
                        <p className="text-sm font-medium text-gray-900">{feature.name}</p>
              </div>
                      <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
            </Link>
          ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance</CardTitle>
                <CardDescription>Last 7 days summary</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="font-medium">Attendance Rate</div>
                      <div className="text-gray-500">
                        {Math.round((dashboardStats?.attendance.weekly.present / dashboardStats?.attendance.weekly.total) * 100)}%
                      </div>
                    </div>
                    <div className="h-8 w-full rounded-full overflow-hidden bg-gray-200 flex">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(dashboardStats?.attendance.weekly.present / dashboardStats?.attendance.weekly.total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${(dashboardStats?.attendance.weekly.late / dashboardStats?.attendance.weekly.total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${(dashboardStats?.attendance.weekly.absent / dashboardStats?.attendance.weekly.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span>Present</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span>Late</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span>Absent</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-500">Present</div>
                        <div className="font-medium">{dashboardStats?.attendance.weekly.present} students</div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-500">Late</div>
                        <div className="font-medium">{dashboardStats?.attendance.weekly.late} students</div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-500">Absent</div>
                        <div className="font-medium">{dashboardStats?.attendance.weekly.absent} students</div>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t">
                        <div className="text-gray-500">Total</div>
                        <div className="font-medium">{dashboardStats?.attendance.weekly.total} students</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/dashboard/teacher/attendance">View Attendance Records</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TeacherDashboard