import { useState, useEffect } from 'react';
import { User } from '../../../types/auth';
import { StudentLayout } from '../../../components/dashboard/layout/student-layout';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Star, 
  Loader2,
  Edit,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { feedbackService, Feedback as FeedbackType, SubmitFeedbackRequest, UpdateFeedbackRequest } from '../../../services/feedback-service';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { studentService } from '../../../services/student-service';

interface StudentFeedbackProps {
  user: User;
}

interface Course {
  id: string;
  name: string;
  hasFeedback?: boolean;  // Added to track if course already has feedback
}

export default function StudentFeedback({ user }: StudentFeedbackProps) {
  // State for form
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('give-feedback');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<FeedbackType[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  // Debug function to display data structure
  const debugData = (data: unknown, label: string): void => {
    console.log(`===== DEBUG ${label} =====`);
    console.log(JSON.stringify(data, null, 2));
    
    if (Array.isArray(data)) {
      console.log(`${label} is an array with ${data.length} items`);
      if (data.length > 0) {
        console.log(`First item sample:`, data[0]);
      } else {
        console.log(`${label} array is empty`);
      }
    } else if (data === null) {
      console.log(`${label} is null`);
    } else if (data === undefined) {
      console.log(`${label} is undefined`);
    } else {
      console.log(`${label} type:`, typeof data);
    }
  };

  // Function to manually refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Refreshing feedback data...");
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      try {
        // Add debug logging
        console.log('Starting to fetch courses for student feedback...');
        
        // Fetch student's courses using the student service
        const fetchedCourses = await studentService.getStudentCourses();
        console.log('Fetched courses from service:', fetchedCourses);
        debugData(fetchedCourses, 'COURSES');
        
        // Check if we actually have courses
        if (!Array.isArray(fetchedCourses) || fetchedCourses.length === 0) {
          console.warn('No courses were found or courses is not an array');
          setCourses([]);
          setSubmissions([]);
          toast.error(
            Array.isArray(fetchedCourses) 
              ? 'You are not enrolled in any courses. Please enroll in a course to provide feedback.' 
              : 'There was an issue loading your courses. Please try again later.'
          );
          setIsLoading(false);
          return;
        }
        
        // Fetch feedback submissions
        console.log('Fetching feedback submissions...');
        const feedbackData = await feedbackService.getStudentFeedback();
        console.log('Feedback submissions:', feedbackData);
        debugData(feedbackData, 'FEEDBACK');
        
        // Check if the feedback data is in the expected format
        if (!Array.isArray(feedbackData)) {
          console.error('Feedback data is not an array:', feedbackData);
          throw new Error('Invalid feedback data format');
        }
        
        // Try to add course names to feedback entries if they're missing
        const enhancedFeedback = feedbackData.map(feedback => {
          if (!feedback.courseName) {
            const course = fetchedCourses.find(c => c.id === feedback.courseId);
            if (course) {
              return { ...feedback, courseName: course.name };
            }
          }
          return feedback;
        });
        
        // Check if we found any course that doesn't exist in the course list
        const unknownCourseIds = feedbackData
          .filter(feedback => !fetchedCourses.some(course => course.id === feedback.courseId))
          .map(feedback => feedback.courseId);
        
        if (unknownCourseIds.length > 0) {
          console.warn('Found feedback for courses that are not in your course list:', unknownCourseIds);
        }
        
        // Explicitly log the IDs of all courses and feedback for comparison
        console.log('All course IDs:', fetchedCourses.map(c => c.id));
        console.log('All feedback courseIds:', feedbackData.map(f => f.courseId));
        
        setSubmissions(enhancedFeedback);
        
        // Mark courses that already have feedback
        const coursesWithFeedbackStatus = fetchedCourses.map(course => {
          const hasFeedback = enhancedFeedback.some(feedback => feedback.courseId === course.id);
          console.log(`Course ${course.name} (${course.id}) has feedback: ${hasFeedback}`);
          return {
            ...course,
            hasFeedback
          };
        });
        
        // Set courses in state
        setCourses(coursesWithFeedbackStatus);
        
        // Generate a summary for debugging
        const withFeedback = coursesWithFeedbackStatus.filter(c => c.hasFeedback).length;
        const withoutFeedback = coursesWithFeedbackStatus.length - withFeedback;
        console.log(`Feedback summary: ${withFeedback} courses with feedback, ${withoutFeedback} without feedback`);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', JSON.stringify(error));
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLoadingError(errorMessage);
        toast.error('Failed to load course data. Please try again later.');
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Get existing feedback for a course
  const getExistingFeedback = (courseId: string) => {
    const feedback = submissions.find(feedback => feedback.courseId === courseId);
    console.log(`Looking for feedback for course ${courseId}:`, feedback);
    return feedback;
  };

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    
    // Check if course already has feedback
    const existingFeedback = getExistingFeedback(courseId);
    if (existingFeedback) {
      // If the course has feedback, suggest editing instead
      toast.custom((t) => (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 shadow-md">
          <div className="flex items-start">
            <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">You've already submitted feedback</h3>
              <p className="text-sm text-amber-700 mt-1">
                You already provided feedback for this course. You can view or edit your feedback in the History tab.
              </p>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    toast.dismiss(t.id);
                    handleEdit(existingFeedback);
                  }}
                  className="mr-2 bg-white"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Feedback
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    toast.dismiss(t.id);
                    setActiveTab('history');
                  }}
                >
                  View History
                </Button>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 8000 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedCourse && !isEditing) {
      setFormError('Please select a course');
      return;
    }
    
    if (rating === 0) {
      setFormError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setFormError('Please enter a comment');
      return;
    }
    
    setFormError('');
    setSubmitting(true);
    
    try {
      if (isEditing && editingFeedbackId) {
        // Update existing feedback
        const updateData: UpdateFeedbackRequest = {
          rating,
          comment
        };
        
        await feedbackService.updateFeedback(editingFeedbackId, updateData);
        toast.success('Feedback updated successfully');
        
        // Reset editing state
        setIsEditing(false);
        setEditingFeedbackId(null);
      } else {
        // Check if feedback already exists for this course
        const existingFeedback = getExistingFeedback(selectedCourse);
        if (existingFeedback) {
          setSubmitting(false);
          toast.error('You have already submitted feedback for this course');
          return;
        }
        
        // Submit new feedback
        console.log("Selected course ID:", selectedCourse);
        console.log("Available courses:", courses);
        
        const feedbackData: SubmitFeedbackRequest = {
          courseId: selectedCourse,
          rating,
          comment
        };
        
        const result = await feedbackService.submitFeedback(feedbackData);
        console.log("Feedback submission result:", result);
        toast.success('Feedback submitted successfully');
      }
      
      // Reset form
      setSelectedCourse('');
      setRating(0);
      setComment('');
      
      // Refresh feedback submissions
      const updatedFeedback = await feedbackService.getStudentFeedback();
      console.log("Updated feedback after submission:", updatedFeedback);
      setSubmissions(updatedFeedback);
      
      // Switch to history tab
      setActiveTab('history');
      
      // Refresh all data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feedback: FeedbackType) => {
    console.log("Editing feedback:", feedback);
    
    // Set form fields with existing values
    setRating(feedback.rating);
    setComment(feedback.comment);
    
    // Set editing state
    setIsEditing(true);
    setEditingFeedbackId(feedback.id);
    
    // Switch to give-feedback tab
    setActiveTab('give-feedback');
  };

  const cancelEdit = () => {
    // Reset form and editing state
    setSelectedCourse('');
    setRating(0);
    setComment('');
    setIsEditing(false);
    setEditingFeedbackId(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Calculate stats
  const totalCourses = courses.length;
  const coursesWithFeedback = courses.filter(c => c.hasFeedback).length;
  const coursesWithoutFeedback = totalCourses - coursesWithFeedback;

  return (
    <StudentLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Feedback</h1>
            <p className="mt-1 text-sm text-gray-500">
              Share your thoughts and help improve your courses
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{coursesWithFeedback}</span> of <span className="font-medium">{totalCourses}</span> courses with feedback
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${totalCourses ? (coursesWithFeedback / totalCourses) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="ml-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loadingError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
            <h3 className="font-medium">Error loading data</h3>
            <p className="text-sm mt-1">{loadingError}</p>
            <p className="text-sm mt-2">Please try refreshing the page or clicking the refresh button above.</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="give-feedback">
              {isEditing ? 'Edit Feedback' : 'Give Feedback'}
            </TabsTrigger>
            <TabsTrigger value="history">Feedback History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="give-feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Edit Feedback' : 'Submit Course Feedback'}
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2" 
                      onClick={cancelEdit}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your feedback helps instructors improve their teaching and course content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {!isEditing && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Course</label>
                        <Select value={selectedCourse} onValueChange={handleCourseChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.length > 0 ? (
                              courses.map(course => (
                                <SelectItem 
                                  key={course.id} 
                                  value={course.id}
                                  className="flex items-center"
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{course.name}</span>
                                    {course.hasFeedback && (
                                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-courses" disabled>
                                No courses available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {coursesWithoutFeedback === 0 && courses.length > 0 && (
                          <div className="mt-2 text-amber-600 text-sm flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            You've already submitted feedback for all your courses.
                            <Button 
                              variant="link" 
                              className="p-0 h-auto ml-1"
                              onClick={() => setActiveTab('history')}
                            >
                              View history
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map(value => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className={`p-2 rounded-full ${
                              rating >= value ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Comments</label>
                      <Textarea
                        placeholder="Share your experience with this course..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={5}
                      />
                    </div>
                    
                    {formError && (
                      <div className="text-red-500 text-sm">{formError}</div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={submitting || (!isEditing && coursesWithoutFeedback === 0)} 
                      className="w-full"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          {isEditing ? (
                            <>
                              <Edit className="mr-2 h-4 w-4" />
                              Update Feedback
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Feedback
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback History</CardTitle>
                <CardDescription>
                  Review feedback you've submitted for your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-6">
                    {submissions.map(submission => (
                      <div key={submission.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">{submission.courseName}</h3>
                            <div className="flex items-center mt-1">
                              <div className="flex mr-2">
                                {[1, 2, 3, 4, 5].map(value => (
                                  <Star
                                    key={value}
                                    className={`h-4 w-4 ${
                                      submission.rating >= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                Submitted on {formatDate(submission.submittedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(submission)}
                              disabled={submission.status === 'reviewed'}
                              title={submission.status === 'reviewed' ? "Cannot edit after teacher has reviewed" : "Edit feedback"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Badge variant={submission.status === 'reviewed' ? 'secondary' : 'outline'}>
                              {submission.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-gray-700">{submission.comment}</p>
                        </div>
                        
                        {submission.teacherResponse && (
                          <div className="border-t pt-4 mt-4">
                            <div className="flex items-center mb-2">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={submission.teacherAvatar} />
                                <AvatarFallback>
                                  {submission.teacherFirstName?.[0]}{submission.teacherLastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {submission.teacherFirstName} {submission.teacherLastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Responded on {formatDate(submission.teacherResponseDate || '')}
                                </p>
                              </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-gray-700">{submission.teacherResponse}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback yet</h3>
                    <p className="text-gray-500">
                      You haven't submitted any feedback for your courses yet.
                    </p>
                    {courses.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab('give-feedback')}
                      >
                        Submit your first feedback
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}