import { useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { TeacherLayout } from '../../components/dashboard/layout/teacher-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  WifiOff,
  Loader2,
  Save,
  Star,
  StarHalf
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { teacherService, ReceivedFeedbackItem } from '../../services/teacher-service';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

interface TeacherFeedbackPageProps {
  user: User;
}

interface Student {
  id: string;
  name: string;
  profileImage?: string;
  className: string;
}

interface FeedbackItem {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  type: 'academic' | 'behavioral' | 'attendance' | 'general';
  content: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'addressed';
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  name: string;
}

interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  addressed: number;
  byType: {
    academic: number;
    behavioral: number; 
    attendance: number;
    general: number;
  };
  averageRating: number;
}

interface NewFeedback {
  studentId: string;
  courseId: string;
  type: 'academic' | 'behavioral' | 'attendance' | 'general';
  content: string;
  rating?: number;
  isPrivate: boolean;
}

interface CourseStatistics {
  courseId: string;
  courseName: string;
  averageRating: number;
  totalFeedback: number;
}

export function TeacherFeedbackPage({ user }: TeacherFeedbackPageProps) {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [newFeedback, setNewFeedback] = useState<NewFeedback>({
    studentId: '',
    courseId: '',
    type: 'academic',
    content: '',
    isPrivate: false
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // New state for received feedback
  const [receivedFeedback, setReceivedFeedback] = useState<ReceivedFeedbackItem[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStatistics[]>([]);
  const [receivedSearchQuery, setReceivedSearchQuery] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  
  // Check API connection
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await teacherService.checkApiConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check API connection first
        await checkConnection();
        
        // Fetch all required data
        const [studentsData, coursesData, feedbackData, statsData, receivedFeedbackData] = await Promise.all([
          teacherService.getStudents(),
          teacherService.getCourses(),
          teacherService.getFeedback(),
          teacherService.getFeedbackStats(),
          teacherService.getReceivedFeedback()
        ]);
        
        setStudents(studentsData);
        setCourses(coursesData);
        setFeedback(feedbackData);
        setStats(statsData);
        setReceivedFeedback(receivedFeedbackData);
        
        // Recalculate course statistics for received feedback
        const courseMap = new Map<string, { sum: number; count: number; name: string }>();
        
        receivedFeedbackData.forEach((item: ReceivedFeedbackItem) => {
          if (!courseMap.has(item.courseId)) {
            courseMap.set(item.courseId, {
              sum: 0,
              count: 0,
              name: item.courseName
            });
          }
          
          const courseData = courseMap.get(item.courseId)!;
          courseData.sum += item.rating;
          courseData.count += 1;
        });
        
        const calculatedStats: CourseStatistics[] = Array.from(courseMap.entries()).map(([courseId, data]) => ({
          courseId,
          courseName: data.name,
          averageRating: data.sum / data.count,
          totalFeedback: data.count
        }));
        
        setCourseStats(calculatedStats);
      } catch (err: Error | unknown) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feedback data. Please try again.');
        toast.error('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle creating new feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newFeedback.studentId) {
      toast.error('Please select a student');
      return;
    }
    if (!newFeedback.courseId) {
      toast.error('Please select a course');
      return;
    }
    if (!newFeedback.content || newFeedback.content.trim().length < 10) {
      toast.error('Please enter feedback content (minimum 10 characters)');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Submit the new feedback
      const createdFeedback = await teacherService.createFeedback(newFeedback);
      
      // Update the feedback list
      setFeedback([createdFeedback, ...feedback]);
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          total: stats.total + 1,
          pending: stats.pending + 1,
          byType: {
            ...stats.byType,
            [newFeedback.type]: stats.byType[newFeedback.type as keyof typeof stats.byType] + 1
          }
        });
      }
      
      // Reset form
      setNewFeedback({
        studentId: '',
        courseId: '',
        type: 'academic',
        content: '',
        isPrivate: false
      });
      
      // Show success message
      toast.success('Feedback submitted successfully');
      
      // Switch to list tab
      setActiveTab('list');
    } catch (err: Error | unknown) {
      console.error('Failed to submit feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle updating feedback status
  const handleUpdateStatus = async (feedbackId: string, newStatus: FeedbackItem['status']) => {
    // Find the feedback item
    const feedbackItem = feedback.find(f => f.id === feedbackId);
    if (!feedbackItem) return;
    
    // Don't update if status is the same
    if (feedbackItem.status === newStatus) return;
    
    try {
      // Optimistically update UI
      setFeedback(feedback.map(f => 
        f.id === feedbackId ? { ...f, status: newStatus } : f
      ));
      
      // Update stats
      if (stats) {
        const oldStatus = feedbackItem.status;
        setStats({
          ...stats,
          [oldStatus]: stats[oldStatus as keyof FeedbackStats] as number - 1,
          [newStatus]: stats[newStatus as keyof FeedbackStats] as number + 1
        });
      }
      
      // Send update to server
      await teacherService.updateFeedbackStatus(feedbackId, newStatus);
      
      // Show success toast
      toast.success(`Feedback status updated to ${newStatus}`);
    } catch (err: Error | unknown) {
      console.error('Failed to update feedback status:', err);
      
      // Revert changes in case of error
      setFeedback(feedback);
      toast.error('Failed to update feedback status');
    }
  };
  
  // Handle refreshing data
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check connection first
      await checkConnection();
      
      // Fetch all required data
      const [studentsData, coursesData, feedbackData, statsData, receivedFeedbackData] = await Promise.all([
        teacherService.getStudents(),
        teacherService.getCourses(),
        teacherService.getFeedback(),
        teacherService.getFeedbackStats(),
        teacherService.getReceivedFeedback()
      ]);
      
      setStudents(studentsData);
      setCourses(coursesData);
      setFeedback(feedbackData);
      setStats(statsData);
      setReceivedFeedback(receivedFeedbackData);
      
      // Recalculate course statistics for received feedback
      const courseMap = new Map<string, { sum: number; count: number; name: string }>();
      
      receivedFeedbackData.forEach((item: ReceivedFeedbackItem) => {
        if (!courseMap.has(item.courseId)) {
          courseMap.set(item.courseId, {
            sum: 0,
            count: 0,
            name: item.courseName
          });
        }
        
        const courseData = courseMap.get(item.courseId)!;
        courseData.sum += item.rating;
        courseData.count += 1;
      });
      
      const calculatedStats: CourseStatistics[] = Array.from(courseMap.entries()).map(([courseId, data]) => ({
        courseId,
        courseName: data.name,
        averageRating: data.sum / data.count,
        totalFeedback: data.count
      }));
      
      setCourseStats(calculatedStats);
      
      toast.success('Data refreshed successfully');
    } catch (err: Error | unknown) {
      console.error('Failed to refresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data. Please try again.');
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Render star rating for received feedback
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
        {halfStar && <StarHalf className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Filter feedback based on search query and filters
  const filteredFeedback = feedback.filter(item => {
    // Apply search query filter
    if (searchQuery && !item.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.courseName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply type filter
    if (filterType !== 'all' && item.type !== filterType) {
      return false;
    }
    
    // Apply status filter
    if (filterStatus !== 'all' && item.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  // Get status badge variant
  const getStatusBadge = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reviewed</Badge>;
      case 'addressed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Addressed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get type badge variant
  const getTypeBadge = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'academic':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Academic</Badge>;
      case 'behavioral':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Behavioral</Badge>;
      case 'attendance':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Attendance</Badge>;
      case 'general':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">General</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get available course options from the data for received feedback
  const courseOptions = [
    { id: 'all', name: 'All Courses' },
    ...courseStats.map(stat => ({ id: stat.courseId, name: stat.courseName }))
  ];

  // Filter received feedback based on search query and filters
  const filteredReceivedFeedback = receivedFeedback.filter(item => {
    // Apply search query filter
    if (receivedSearchQuery && !item.content.toLowerCase().includes(receivedSearchQuery.toLowerCase()) &&
        !item.courseName.toLowerCase().includes(receivedSearchQuery.toLowerCase()) &&
        (item.studentName && !item.studentName.toLowerCase().includes(receivedSearchQuery.toLowerCase()))) {
      return false;
    }
    
    // Apply course filter
    if (filterCourse !== 'all' && item.courseId !== filterCourse) {
      return false;
    }
    
    // Apply rating filter
    if (filterRating !== 'all') {
      const ratingValue = parseInt(filterRating);
      if (Math.floor(item.rating) !== ratingValue) {
        return false;
      }
    }
    
    return true;
  });

  // Show loading state
  if (loading) {
  return (
      <TeacherLayout user={user}>
        <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Loading feedback data...</p>
          </div>
      </TeacherLayout>
    );
  }
  
  // Show error state
  if (error && !feedback.length && !students.length && !courses.length) {
    return (
      <TeacherLayout user={user}>
        <div className="p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-4">
                <Button onClick={handleRefresh} disabled={loading}>
                  Try Again
                </Button>
                    </div>
            </AlertDescription>
          </Alert>
                    </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout user={user}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback System</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage feedback for your students and view feedback from your students
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection status indicator */}
            <div className="flex items-center">
              {connectionStatus === 'connected' ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3" />
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
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            
            {/* Create button - only shown when not on the create tab */}
            {activeTab !== 'create' && (
              <Button 
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                <span>New Feedback</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Stats cards - show appropriate stats based on active tab */}
        {activeTab === 'list' || activeTab === 'stats' || activeTab === 'create' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-sm text-gray-500">Feedback entries submitted</p>
              </CardContent>
            </Card>
              
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                <p className="text-sm text-gray-500">Awaiting action</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.reviewed || 0}</div>
                <p className="text-sm text-gray-500">Assessed feedback</p>
              </CardContent>
            </Card>
              
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Addressed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.addressed || 0}</div>
                <p className="text-sm text-gray-500">Fully resolved</p>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'received' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {courseStats.length > 0 ? (
              courseStats.map((stat) => (
                <Card key={stat.courseId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{stat.courseName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {renderStarRating(stat.averageRating)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{stat.totalFeedback} feedback submissions</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-4">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No feedback data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
        
        {/* Main content tabs */}
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">Feedback Given</TabsTrigger>
            <TabsTrigger value="received">Received Feedback</TabsTrigger>
            <TabsTrigger value="create">Create Feedback</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All Feedback</CardTitle>
                <CardDescription>
                  Browse all feedback submitted to students
                </CardDescription>
                
                {/* Search and filter */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search by student, course or content..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                              </div>
                  
                  <div className="flex gap-4">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[160px]">
                        <Filter className="mr-2" size={16} />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[160px]">
                        <Filter className="mr-2" size={16} />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="addressed">Addressed</SelectItem>
                      </SelectContent>
                    </Select>
                            </div>
                            </div>
              </CardHeader>
              
              <CardContent>
                {filteredFeedback.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary-100 text-primary-700">
                                  {item.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>{item.studentName}</div>
                </div>
                          </TableCell>
                          <TableCell>{item.courseName}</TableCell>
                          <TableCell>{getTypeBadge(item.type)}</TableCell>
                          <TableCell>{format(parseISO(item.createdAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                  <Select
                                value={item.status} 
                                onValueChange={(value) => handleUpdateStatus(item.id, value as FeedbackItem['status'])}
                  >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="addressed">Addressed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No feedback found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Start by creating some feedback for your students'}
                    </p>
                    {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
                      <Button variant="outline" className="mt-4" onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                        setFilterStatus('all');
                      }}>
                        Clear Filters
                                </Button>
                              )}
                              </div>
                            )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle>Received Feedback</CardTitle>
                <CardDescription>
                  Browse feedback received from students
                </CardDescription>
                
                {/* Search and filter */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search by student, course or content..."
                      className="pl-10"
                      value={receivedSearchQuery}
                      onChange={(e) => setReceivedSearchQuery(e.target.value)}
                    />
                              </div>
                  
                  <div className="flex gap-4">
                    <Select value={filterCourse} onValueChange={setFilterCourse}>
                      <SelectTrigger className="w-[160px]">
                        <Filter className="mr-2" size={16} />
                        <SelectValue placeholder="Filter by course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterRating} onValueChange={setFilterRating}>
                      <SelectTrigger className="w-[160px]">
                        <Filter className="mr-2" size={16} />
                        <SelectValue placeholder="Filter by rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                            </div>
                            </div>
              </CardHeader>
              
              <CardContent>
                {filteredReceivedFeedback.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Content</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceivedFeedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.isAnonymous ? (
                              <span className="text-gray-500 italic">Anonymous</span>
                            ) : (
                              item.studentName || 'Unknown'
                            )}
                          </TableCell>
                          <TableCell>{item.courseName}</TableCell>
                          <TableCell>{renderStarRating(item.rating)}</TableCell>
                          <TableCell>{format(parseISO(item.createdAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <p className="max-w-lg truncate">{item.content}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No feedback found</h3>
                    <p className="text-gray-500 mt-1">
                      {receivedSearchQuery || filterCourse !== 'all' || filterRating !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Start by receiving some feedback from your students'}
                    </p>
                    {(receivedSearchQuery || filterCourse !== 'all' || filterRating !== 'all') && (
                      <Button variant="outline" className="mt-4" onClick={() => {
                        setReceivedSearchQuery('');
                        setFilterCourse('all');
                        setFilterRating('all');
                      }}>
                        Clear Filters
                                </Button>
                              )}
                              </div>
                            )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="create">
              <Card>
                <CardHeader>
                <CardTitle>Create New Feedback</CardTitle>
                  <CardDescription>
                  Provide feedback for a student's performance
                  </CardDescription>
                </CardHeader>
              
              <form onSubmit={handleSubmitFeedback}>
                <CardContent className="space-y-4">
                  {/* Error alert */}
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student</label>
                      <Select 
                        value={newFeedback.studentId} 
                        onValueChange={(value) => setNewFeedback({...newFeedback, studentId: value})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students && students.length > 0 ? (
                            students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              No students available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                  </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Course</label>
                      <Select 
                        value={newFeedback.courseId} 
                        onValueChange={(value) => setNewFeedback({...newFeedback, courseId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses && courses.length > 0 ? (
                            courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              No courses available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                  </div>
            </div>
            
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback Type</label>
                    <Select 
                      value={newFeedback.type} 
                      onValueChange={(value) => setNewFeedback({
                        ...newFeedback, 
                        type: value as 'academic' | 'behavioral' | 'attendance' | 'general'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback Content</label>
                    <Textarea 
                      placeholder="Enter detailed feedback..." 
                      className="min-h-[120px]"
                      value={newFeedback.content}
                      onChange={(e) => setNewFeedback({...newFeedback, content: e.target.value})}
                    />
                            </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="isPrivate" 
                      className="rounded border-gray-300" 
                      checked={newFeedback.isPrivate}
                      onChange={(e) => setNewFeedback({...newFeedback, isPrivate: e.target.checked})}
                    />
                    <label htmlFor="isPrivate" className="text-sm text-gray-700">
                      Make this feedback private (only visible to staff)
                    </label>
                          </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                          <Button 
                    type="button" 
                            variant="outline" 
                            onClick={() => {
                      setActiveTab('list');
                      setError(null);
                            }}
                          >
                    Cancel
                          </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
              <Card>
              <CardHeader>
                <CardTitle>Feedback Statistics</CardTitle>
                <CardDescription>
                  Analyze feedback patterns and performance
                </CardDescription>
                </CardHeader>
              
                <CardContent>
                <div className="space-y-6">
                  {/* Feedback by type */}
                      <div>
                    <h3 className="text-lg font-medium mb-4">Feedback by Type</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Academic</span>
                          <span className="text-sm text-gray-500">
                            {stats ? `${stats.byType.academic} (${Math.round((stats.byType.academic / stats.total) * 100)}%)` : '0 (0%)'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full"
                            style={{ width: stats ? `${(stats.byType.academic / stats.total) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Behavioral</span>
                          <span className="text-sm text-gray-500">
                            {stats ? `${stats.byType.behavioral} (${Math.round((stats.byType.behavioral / stats.total) * 100)}%)` : '0 (0%)'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500 h-full"
                            style={{ width: stats ? `${(stats.byType.behavioral / stats.total) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Attendance</span>
                          <span className="text-sm text-gray-500">
                            {stats ? `${stats.byType.attendance} (${Math.round((stats.byType.attendance / stats.total) * 100)}%)` : '0 (0%)'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full"
                            style={{ width: stats ? `${(stats.byType.attendance / stats.total) * 100}%` : '0%' }}
                          ></div>
                        </div>
            </div>
            
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">General</span>
                          <span className="text-sm text-gray-500">
                            {stats ? `${stats.byType.general} (${Math.round((stats.byType.general / stats.total) * 100)}%)` : '0 (0%)'}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="bg-gray-500 h-full"
                            style={{ width: stats ? `${(stats.byType.general / stats.total) * 100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                    </div>
                </div>
                
                  {/* Feedback by status */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Feedback by Status</h3>
                    <div className="h-36 w-full relative border rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        Status chart visualization would go here
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
}

export default TeacherFeedbackPage;