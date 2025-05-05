import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout';
import { UserResponse } from '../../types/auth';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  FileText, 
  Video, 
  Link as LinkIcon, 
  Download, 
  Upload, 
  Eye, 
  FolderPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import toast, { Toaster } from 'react-hot-toast';

interface CoursesPageProps {
  user: UserResponse;
}

// Course type definition
interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  teacherId: string;
  teacherName: string;
  startDate: Date;
  endDate: Date;
  credits: number;
  maxStudents: number;
  enrolledStudents: number;
  status: 'active' | 'upcoming' | 'completed';
  category: string;
}

// Content type definition
interface CourseContent {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  type: 'document' | 'video' | 'link';
  url: string;
  fileSize?: number;
  duration?: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
}

export const CoursesPage = ({ user }: CoursesPageProps) => {
  // Course state
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  
  // Content state
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(null);
  const [contentSearchQuery, setContentSearchQuery] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState('courses');

  // Mock data for courses
  useEffect(() => {
    // Simulate loading courses from API
    setCourses([
      {
        id: '1',
        name: 'Introduction to Mathematics',
        code: 'MATH101',
        description: 'Fundamental concepts of mathematics including algebra, geometry, and calculus.',
        teacherId: '1',
        teacherName: 'John Smith',
        startDate: new Date(2023, 8, 1),
        endDate: new Date(2023, 11, 15),
        credits: 3,
        maxStudents: 30,
        enrolledStudents: 25,
        status: 'active',
        category: 'Mathematics'
      },
      {
        id: '2',
        name: 'Advanced Physics',
        code: 'PHYS201',
        description: 'In-depth study of mechanics, thermodynamics, and electromagnetism.',
        teacherId: '2',
        teacherName: 'Sarah Johnson',
        startDate: new Date(2023, 8, 1),
        endDate: new Date(2023, 11, 15),
        credits: 4,
        maxStudents: 25,
        enrolledStudents: 20,
        status: 'active',
        category: 'Science'
      },
      {
        id: '3',
        name: 'World Literature',
        code: 'LIT101',
        description: 'Survey of major literary works from around the world.',
        teacherId: '3',
        teacherName: 'Emily Davis',
        startDate: new Date(2024, 0, 15),
        endDate: new Date(2024, 4, 30),
        credits: 3,
        maxStudents: 35,
        enrolledStudents: 0,
        status: 'upcoming',
        category: 'Humanities'
      },
      {
        id: '4',
        name: 'Introduction to Computer Science',
        code: 'CS101',
        description: 'Fundamentals of programming, algorithms, and data structures.',
        teacherId: '4',
        teacherName: 'Michael Chen',
        startDate: new Date(2023, 5, 1),
        endDate: new Date(2023, 7, 15),
        credits: 4,
        maxStudents: 30,
        enrolledStudents: 30,
        status: 'completed',
        category: 'Computer Science'
      }
    ]);
  }, []);

  // Mock data for contents
  useEffect(() => {
    // Simulate loading content from API
    setContents([
      {
        id: '1',
        title: 'Introduction to Algebra',
        description: 'Basic concepts of algebra including variables, equations, and functions.',
        courseId: '1',
        courseName: 'Introduction to Mathematics',
        type: 'document',
        url: '/documents/algebra-intro.pdf',
        fileSize: 2.5 * 1024 * 1024, // 2.5 MB
        uploadedBy: 'John Smith',
        uploadedAt: new Date(2023, 8, 5),
        tags: ['algebra', 'mathematics', 'introduction']
      },
      {
        id: '2',
        title: 'Geometry Fundamentals',
        description: 'Introduction to geometric shapes, angles, and theorems.',
        courseId: '1',
        courseName: 'Introduction to Mathematics',
        type: 'document',
        url: '/documents/geometry-fundamentals.pdf',
        fileSize: 3.2 * 1024 * 1024, // 3.2 MB
        uploadedBy: 'John Smith',
        uploadedAt: new Date(2023, 8, 10),
        tags: ['geometry', 'mathematics', 'shapes']
      },
      {
        id: '3',
        title: 'Understanding Calculus',
        description: 'Video lecture on the basics of calculus.',
        courseId: '1',
        courseName: 'Introduction to Mathematics',
        type: 'video',
        url: '/videos/calculus-intro.mp4',
        duration: 45 * 60, // 45 minutes
        uploadedBy: 'John Smith',
        uploadedAt: new Date(2023, 8, 15),
        tags: ['calculus', 'mathematics', 'video']
      },
      {
        id: '4',
        title: 'Physics Simulation Tools',
        description: 'Online tools for physics simulations.',
        courseId: '2',
        courseName: 'Advanced Physics',
        type: 'link',
        url: 'https://physics-simulations.example.com',
        uploadedBy: 'Sarah Johnson',
        uploadedAt: new Date(2023, 8, 20),
        tags: ['physics', 'simulation', 'tools']
      }
    ]);
  }, []);

  // Filter courses based on search query and selected filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filter contents based on search query and selected filters
  const filteredContents = contents.filter(content => {
    const matchesSearch = 
      content.title.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(contentSearchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || content.type === selectedType;
    const matchesCourse = selectedCourseFilter === 'all' || content.courseId === selectedCourseFilter;
    
    return matchesSearch && matchesType && matchesCourse;
  });

  // Get contents for a specific course
  const getContentsForCourse = (courseId: string) => {
    return contents.filter(content => content.courseId === courseId);
  };

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(courses.map(course => course.category))];

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Handle course creation
  const handleCreateCourse = (newCourse: Omit<Course, 'id'>) => {
    const courseWithId = {
      ...newCourse,
      id: (courses.length + 1).toString()
    };
    setCourses([...courses, courseWithId as Course]);
    setIsCreateModalOpen(false);
    toast.success('Course created successfully');
  };

  // Handle course update
  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(courses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ));
    setIsEditModalOpen(false);
    setCurrentCourse(null);
    toast.success('Course updated successfully');
  };

  // Handle course deletion
  const handleDeleteCourse = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== id));
      // Also delete associated content
      setContents(contents.filter(content => content.courseId !== id));
      toast.success('Course deleted successfully');
    }
  };

  // Handle content upload
  const handleUploadContent = (newContent: Omit<CourseContent, 'id'>) => {
    const contentWithId = {
      ...newContent,
      id: (contents.length + 1).toString(),
      uploadedAt: new Date(),
      uploadedBy: `${user.firstName} ${user.lastName}`
    };
    setContents([...contents, contentWithId as CourseContent]);
    setIsUploadModalOpen(false);
    toast.success('Content uploaded successfully');
  };

  // Handle content deletion
  const handleDeleteContent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      setContents(contents.filter(content => content.id !== id));
      toast.success('Content deleted successfully');
    }
  };

  // Open edit modal with course data
  const openEditModal = (course: Course) => {
    setCurrentCourse(course);
    setIsEditModalOpen(true);
  };

  // Get content icon based on type
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  // Toggle course expansion
  const toggleCourseExpansion = (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
  };

  return (
    <DashboardLayout user={user}>
      <Toaster />
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <div className="flex space-x-2">
            {activeTab === 'courses' && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </button>
            )}
            {activeTab === 'content' && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Content
              </button>
            )}
          </div>
        </div>

        <Tabs defaultValue="courses" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="courses" className="flex-1">Courses</TabsTrigger>
            <TabsTrigger value="content" className="flex-1">Course Content</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                        {/* Expand column */}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <>
                          <tr key={course.id} className="hover:bg-gray-50">
                            <td className="px-2 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => toggleCourseExpansion(course.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedCourse === course.id ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{course.name}</div>
                                  <div className="text-sm text-gray-500">{course.code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.teacherName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {format(course.startDate, 'MMM d, yyyy')} - {format(course.endDate, 'MMM d, yyyy')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                {course.enrolledStudents}/{course.maxStudents}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                course.status === 'active' ? 'bg-green-100 text-green-800' :
                                course.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                onClick={() => openEditModal(course)}
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                          {expandedCourse === course.id && (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Course Content</h3>
                                    <button
                                      className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center text-sm"
                                      onClick={() => {
                                        setCurrentCourse(course);
                                        setIsUploadModalOpen(true);
                                      }}
                                    >
                                      <Upload className="h-4 w-4 mr-1" />
                                      Upload Content
                                    </button>
                                  </div>
                                  
                                  {getContentsForCourse(course.id).length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                      {getContentsForCourse(course.id).map((content) => (
                                        <div key={content.id} className="py-3 flex justify-between items-center">
                                          <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                              {getContentIcon(content.type)}
                                            </div>
                                            <div className="ml-4">
                                              <div className="text-sm font-medium text-gray-900">{content.title}</div>
                                              <div className="text-xs text-gray-500">
                                                {content.type === 'document' && formatFileSize(content.fileSize)}
                                                {content.type === 'video' && formatDuration(content.duration)}
                                                {content.type === 'link' && 'External Link'}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                              <Eye className="h-5 w-5" />
                                            </button>
                                            <button className="text-blue-600 hover:text-blue-900">
                                              <Download className="h-5 w-5" />
                                            </button>
                                            <button 
                                              className="text-red-600 hover:text-red-900"
                                              onClick={() => handleDeleteContent(content.id)}
                                            >
                                              <Trash2 className="h-5 w-5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      No content available for this course.
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No courses found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={contentSearchQuery}
                      onChange={(e) => setContentSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="document">Documents</option>
                      <option value="video">Videos</option>
                      <option value="link">Links</option>
                    </select>
                  </div>
                  <div>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedCourseFilter}
                      onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    >
                      <option value="all">All Courses</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size/Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContents.length > 0 ? (
                      filteredContents.map((content) => (
                        <tr key={content.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                {getContentIcon(content.type)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{content.title}</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">{content.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{content.courseName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              content.type === 'document' ? 'bg-blue-100 text-blue-800' :
                              content.type === 'video' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {content.type === 'document' && formatFileSize(content.fileSize)}
                              {content.type === 'video' && formatDuration(content.duration)}
                              {content.type === 'link' && '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {format(new Date(content.uploadedAt), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              by {content.uploadedBy}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              <Eye className="h-5 w-5" />
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              <Download className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteContent(content.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No content found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Course Modal (Would be implemented as a component) */}
        {/* Would contain form fields for course creation/editing */}

        {/* Upload Content Modal (Would be implemented as a component) */}
        {/* Would contain form fields for content upload/creation */}
      </div>
    </DashboardLayout>
  );
}; 