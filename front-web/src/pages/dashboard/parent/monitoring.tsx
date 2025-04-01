import { useState, useEffect } from 'react';
import { ParentLayout } from '../../../components/dashboard/layout/parent-layout';
import { User } from '../../../types/auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'react-hot-toast';
import { 
  GraduationCap, 
  Calendar, 
  Book, 
  Clock, 
  LineChart, 
  Bell, 
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { parentService } from '../../../services/parent-service';

interface ParentMonitoringPageProps {
  user: User;
}

interface Child {
  id: string;
  name: string;
  grade: string;
  profileImage?: string;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number;
  grade: string | number;
  lastActivity: string;
  teacher: string;
}

interface RecentActivity {
  id: string;
  type: 'assignment' | 'attendance' | 'grade' | 'behavior' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'positive' | 'negative' | 'neutral';
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'assignment' | 'event' | 'holiday';
}

interface ChildMonitoringData {
  child: Child;
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
  courseProgress: CourseProgress[];
  recentActivities: RecentActivity[];
  upcomingEvents: UpcomingEvent[];
  performanceTrend: {
    subject: string;
    currentGrade: number;
    previousGrade: number;
    changeDirection: 'up' | 'down' | 'stable';
  }[];
}

export function ParentMonitoringPage({ user }: ParentMonitoringPageProps) {
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [children, setChildren] = useState<Child[]>([]);
  const [monitoringData, setMonitoringData] = useState<ChildMonitoringData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch children list on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await parentService.getChildren();
        setChildren(childrenData);
        // Select first child by default if available
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch children:', error);
        toast.error('Failed to load children data');
      }
    };

    fetchChildren();
  }, []);

  // Fetch monitoring data for selected child
  useEffect(() => {
    if (!selectedChild) return;

    const fetchMonitoringData = async () => {
      setLoading(true);
      try {
        const data = await parentService.getChildMonitoringData(selectedChild);
        setMonitoringData(data);
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
        toast.error('Failed to load monitoring data');
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();
  }, [selectedChild]);

  const handleChildChange = (childId: string) => {
    setSelectedChild(childId);
  };

  const getStatusIcon = (status?: string) => {
    if (status === 'positive') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'negative') return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <Book className="h-5 w-5 text-red-500" />;
      case 'assignment':
        return <GraduationCap className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'holiday':
        return <Bell className="h-5 w-5 text-green-500" />;
    default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading && !monitoringData) {
    return (
      <ParentLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Monitoring</h1>
            <p className="text-sm text-gray-500">Track your child's academic progress and activities</p>
          </div>
          <div className="w-64">
            <Select value={selectedChild} onValueChange={handleChildChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} - {child.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {monitoringData && (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Student Info Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {monitoringData.child.profileImage ? (
                        <img 
                          src={monitoringData.child.profileImage} 
                          alt={monitoringData.child.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <GraduationCap className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                <div>
                      <h3 className="text-lg font-semibold">{monitoringData.child.name}</h3>
                      <p className="text-sm text-gray-500">{monitoringData.child.grade}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline">Student ID: {monitoringData.child.id}</Badge>
                </div>
              </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((monitoringData.attendance.present / monitoringData.attendance.total) * 100)}%
                    </div>
                    <Progress 
                      value={(monitoringData.attendance.present / monitoringData.attendance.total) * 100} 
                      className="h-2 mt-2"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {monitoringData.courseProgress.reduce((sum, course) => sum + Number(course.grade), 0) / 
                        monitoringData.courseProgress.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Across all courses
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {monitoringData.upcomingEvents.filter(event => event.type === 'exam').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      In the next 30 days
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(monitoringData.courseProgress.reduce((sum, course) => sum + course.progress, 0) / 
                        monitoringData.courseProgress.length)}%
                    </div>
                    <Progress 
                      value={monitoringData.courseProgress.reduce((sum, course) => sum + course.progress, 0) / 
                        monitoringData.courseProgress.length} 
                      className="h-2 mt-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest updates on your child's academic journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monitoringData.recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                        <div className="mt-1">{getStatusIcon(activity.status)}</div>
                  <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <div className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</div>
                  </div>
                </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Activities</Button>
                </CardFooter>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Important dates and deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monitoringData.upcomingEvents.slice(0, 4).map((event) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div className="rounded-md bg-gray-50 p-2">
                          {getEventIcon(event.type)}
                  </div>
                  <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Full Calendar</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="academics" className="space-y-6 mt-6">
              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Progress</CardTitle>
                  <CardDescription>Current performance in all subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {monitoringData.courseProgress.map((course) => (
                      <div key={course.courseId} className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{course.courseName}</h4>
                            <p className="text-sm text-gray-500">Teacher: {course.teacher}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold">{course.grade}</span>
                            <p className="text-xs text-gray-500">Current Grade</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                          <Progress value={course.progress} className="h-2 flex-grow" />
                          <span className="text-sm font-medium">{course.progress}%</span>
                        </div>
                        <p className="text-xs text-gray-500">Last activity: {formatDate(course.lastActivity)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>Grade changes compared to previous period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monitoringData.performanceTrend.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <h4 className="font-medium">{trend.subject}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Previous: {trend.previousGrade}</div>
                            <div className="font-bold">Current: {trend.currentGrade}</div>
                  </div>
                  <div>
                            {trend.changeDirection === 'up' && (
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <LineChart className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                            {trend.changeDirection === 'down' && (
                              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <LineChart className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                            {trend.changeDirection === 'stable' && (
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <LineChart className="h-4 w-4 text-blue-600" />
                  </div>
                            )}
                </div>
              </div>
            </div>
          ))}
        </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6 mt-6">
              {/* Attendance Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                  <CardDescription>Overview of attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-sm font-medium text-gray-500">Present</div>
                      <div className="mt-1 text-2xl font-bold text-green-600">{monitoringData.attendance.present}</div>
                      <div className="text-xs text-gray-500">days</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-sm font-medium text-gray-500">Absent</div>
                      <div className="mt-1 text-2xl font-bold text-red-600">{monitoringData.attendance.absent}</div>
                      <div className="text-xs text-gray-500">days</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-sm font-medium text-gray-500">Late</div>
                      <div className="mt-1 text-2xl font-bold text-yellow-600">{monitoringData.attendance.late}</div>
                      <div className="text-xs text-gray-500">days</div>
                      </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-sm font-medium text-gray-500">Excused</div>
                      <div className="mt-1 text-2xl font-bold text-blue-600">{monitoringData.attendance.excused}</div>
                      <div className="text-xs text-gray-500">days</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Attendance Distribution</h4>
                    <div className="h-8 w-full rounded-full overflow-hidden bg-gray-200 flex">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(monitoringData.attendance.present / monitoringData.attendance.total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${(monitoringData.attendance.late / monitoringData.attendance.total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ width: `${(monitoringData.attendance.excused / monitoringData.attendance.total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${(monitoringData.attendance.absent / monitoringData.attendance.total) * 100}%` }}
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
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span>Excused</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span>Absent</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Request Attendance Report</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6 mt-6">
              {/* All Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>All Activities</CardTitle>
                  <CardDescription>Comprehensive list of all student activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {monitoringData.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                        <div className="mt-1">{getStatusIcon(activity.status)}</div>
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <div className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ParentLayout>
  );
}

// Make sure we also export as default for compatibility
export default ParentMonitoringPage;
