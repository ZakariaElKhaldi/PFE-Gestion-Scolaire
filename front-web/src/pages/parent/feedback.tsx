import { useState, useEffect } from "react";
import { UserResponse } from "../../types/auth";
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { Search, ThumbsUp, ThumbsDown, MessageCircle, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { parentService } from "../../services/parent-service";
import { toast } from "react-hot-toast";

interface ParentFeedbackProps {
  user: UserResponse;
}

interface TeacherFeedback {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseId?: string;
  courseName?: string;
  date: string;
  type?: "behavioral" | "academic" | "general";
  sentiment?: "positive" | "negative" | "neutral";
  comment?: string;
  message?: string;
  subject?: string;
  category?: string;
  priority?: string;
  recommendations?: string;
  isRead?: boolean;
}

interface FeedbackStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  behavioral: number;
  academic: number;
  general: number;
}

// Enhanced Error Boundary Component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null);

  useEffect(() => {
    // Handler for uncaught errors
    const errorHandler = (error: ErrorEvent) => {
      console.error('[PARENT-FEEDBACK] Window Error:', error);
      setHasError(true);
      setError(error.error);
    };

    // Handler for unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('[PARENT-FEEDBACK] Unhandled Promise Rejection:', event.reason);
      setHasError(true);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const handleComponentError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to console for debugging
    console.error('[PARENT-FEEDBACK] Component Error:', error);
    console.error('[PARENT-FEEDBACK] Component Stack:', errorInfo.componentStack);
    
    // Update state to render fallback UI
    setHasError(true);
    setError(error);
    setErrorInfo(errorInfo);
  };

  const resetError = () => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    // Force reload the page data
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mb-3">An error occurred while displaying the feedback page.</p>
          
          {error && (
            <div className="mt-2 p-2 bg-white rounded border border-red-100 text-sm font-mono overflow-auto max-h-40">
              <p className="font-medium">Error: {error.message}</p>
              {errorInfo && (
                <pre className="mt-2 text-xs whitespace-pre-wrap text-red-600">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (err) {
    console.error('[PARENT-FEEDBACK] Error during render:', err);
    handleComponentError(
      err instanceof Error ? err : new Error('Unknown error during render'),
      { componentStack: '' } as React.ErrorInfo
    );
    return null;
  }
}

export default function ParentFeedback({ user }: ParentFeedbackProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<TeacherFeedback["type"] | "all">("all");
  const [selectedSentiment, setSelectedSentiment] = useState<TeacherFeedback["sentiment"] | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<TeacherFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<TeacherFeedback | null>(null);
  const [feedbackResponses, setFeedbackResponses] = useState<any[]>([]);
  const [responseText, setResponseText] = useState("");
  const [children, setChildren] = useState<any[]>([]);
  const itemsPerPage = 5;

  /**
   * Helper function for consistent error handling in component
   */
  const handleError = (context: string, error: any) => {
    // Log the error with context
    console.error(`[PARENT-FEEDBACK] ${context} - Error:`, error);
    
    // Log additional details if available
    if (error.response) {
      console.error(`[PARENT-FEEDBACK] ${context} - Status:`, error.response.status);
      console.error(`[PARENT-FEEDBACK] ${context} - Data:`, error.response.data);
    } else if (error.request) {
      console.error(`[PARENT-FEEDBACK] ${context} - No Response:`, error.request);
    } else {
      console.error(`[PARENT-FEEDBACK] ${context} - Message:`, error.message);
    }
    
    // Set component error state
    setError(`Failed to ${context.toLowerCase()}. Please try again later.`);
    
    // Show toast notification
    toast.error(`Error: ${context}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('[PARENT-FEEDBACK] fetchData - Starting data fetch');
      setLoading(true);
      setError(null);
      try {
        // First, get the children list
        console.log('[PARENT-FEEDBACK] fetchData - Fetching children');
        const childrenResponse = await parentService.getChildren();
        setChildren(childrenResponse);
        console.log('[PARENT-FEEDBACK] fetchData - Received children:', childrenResponse.length);

        // Then get feedback
        console.log('[PARENT-FEEDBACK] fetchData - Fetching feedback');
        const feedback = await parentService.getFeedback();
        
        // Map API response to our expected format if needed
        const mappedFeedback = feedback.map((item: any) => {
          return {
            ...item,
            // Map potential property name differences
            comment: item.comment || item.message,
            type: item.type || item.category || 'general',
            sentiment: item.sentiment || 
                      (item.priority === 'high' ? 'negative' : 
                       item.priority === 'medium' ? 'neutral' : 'positive')
          };
        });
        
        // Cast the feedback data to the correct type
        setFeedbackData(mappedFeedback as TeacherFeedback[]);
        console.log('[PARENT-FEEDBACK] fetchData - Received feedback items:', feedback.length);
        
        // Log the first item to help with debugging
        if (feedback.length > 0) {
          console.log('[PARENT-FEEDBACK] fetchData - Sample feedback structure:', feedback[0]);
        }
      } catch (err) {
        handleError('fetch feedback data', err);
        
        // Mock data for children if API fails
        console.log('[PARENT-FEEDBACK] fetchData - Using mock children data');
        setChildren([
          { id: "1", name: "John Smith" },
          { id: "2", name: "Emma Smith" }
        ]);

        // Mock feedback data if API fails
        console.log('[PARENT-FEEDBACK] fetchData - Using mock feedback data');
        setFeedbackData([
          {
            id: "1",
            studentId: "1",
            studentName: "John Smith",
            teacherId: "t1",
            teacherName: "Mr. Anderson",
            courseId: "c1",
            courseName: "Mathematics",
            date: "2024-03-08",
            type: "academic",
            sentiment: "positive",
            comment: "John has shown significant improvement in problem-solving skills.",
            recommendations: "Continue practicing complex word problems."
          },
          {
            id: "2",
            studentId: "2",
            studentName: "Emma Smith",
            teacherId: "t2",
            teacherName: "Ms. Johnson",
            courseId: "c2",
            courseName: "English",
            date: "2024-03-07",
            type: "behavioral",
            sentiment: "negative",
            comment: "Emma has been disruptive in class this week.",
            recommendations: "Please discuss classroom behavior at home."
          },
          {
            id: "3",
            studentId: "1",
            studentName: "John Smith",
            teacherId: "t3",
            teacherName: "Mr. Williams",
            courseId: "c3",
            courseName: "Science",
            date: "2024-03-05",
            type: "general",
            sentiment: "neutral",
            comment: "John participated in the science fair project.",
            recommendations: "Consider joining the science club."
          }
        ]);
      } finally {
        setLoading(false);
        console.log('[PARENT-FEEDBACK] fetchData - Completed');
      }
    };

    fetchData();
  }, []);

  const handleViewResponses = async (feedback: TeacherFeedback) => {
    console.log('[PARENT-FEEDBACK] handleViewResponses - Viewing responses for feedback:', feedback.id);
    setSelectedFeedback(feedback);
    setLoading(true);
    try {
      const responses = await parentService.getFeedbackResponses(feedback.id);
      setFeedbackResponses(responses);
      console.log('[PARENT-FEEDBACK] handleViewResponses - Received responses:', responses.length);
    } catch (err) {
      handleError('load responses', err);
      setFeedbackResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    console.log('[PARENT-FEEDBACK] handleSendResponse - Sending response for feedback:', selectedFeedback.id);
    setLoading(true);
    try {
      await parentService.respondToFeedback(selectedFeedback.id, { message: responseText });
      toast.success("Response sent successfully");
      setResponseText("");
      console.log('[PARENT-FEEDBACK] handleSendResponse - Response sent successfully');
      
      // Refresh responses
      console.log('[PARENT-FEEDBACK] handleSendResponse - Refreshing responses');
      const responses = await parentService.getFeedbackResponses(selectedFeedback.id);
      setFeedbackResponses(responses);
      console.log('[PARENT-FEEDBACK] handleSendResponse - Updated responses:', responses.length);
    } catch (err) {
      handleError('send response', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (feedbackId: string) => {
    console.log('[PARENT-FEEDBACK] handleMarkAsRead - Marking feedback as read:', feedbackId);
    setLoading(true);
    try {
      await parentService.markFeedbackAsRead(feedbackId);
      toast.success("Marked as read");
      console.log('[PARENT-FEEDBACK] handleMarkAsRead - Successfully marked as read');
      
      // Update local state
      setFeedbackData(prevData => 
        prevData.map(item => 
          item.id === feedbackId ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      handleError('mark as read', err);
    } finally {
      setLoading(false);
    }
  };

  // Fix calculateStats to safely handle undefined properties
  const calculateStats = (feedback: TeacherFeedback[]): FeedbackStats => {
    try {
      console.log('[PARENT-FEEDBACK] calculateStats - Processing feedback array:', feedback.length, 'items');
      
      // Handle empty array case
      if (!feedback || feedback.length === 0) {
        console.log('[PARENT-FEEDBACK] calculateStats - Empty feedback array, returning zero stats');
        return {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          behavioral: 0,
          academic: 0,
          general: 0,
        };
      }
      
      return feedback.reduce((stats, item) => {
        try {
          // Get safe values for properties that might be undefined
          const type = (item?.type || item?.category || 'general').toLowerCase();
          const sentiment = (item?.sentiment || 'neutral').toLowerCase();
          
          // Update stats based on type
          let updatedStats = { ...stats, total: stats.total + 1 };
          
          // Update sentiment counts
          if (sentiment === 'positive') updatedStats.positive += 1;
          else if (sentiment === 'negative') updatedStats.negative += 1;
          else updatedStats.neutral += 1;
          
          // Update type counts
          if (type === 'behavioral') updatedStats.behavioral += 1;
          else if (type === 'academic') updatedStats.academic += 1;
          else updatedStats.general += 1;
          
          return updatedStats;
        } catch (err) {
          console.error('[PARENT-FEEDBACK] calculateStats - Error processing feedback item:', err);
          // Skip this item but continue processing others
          return stats;
        }
      }, {
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        behavioral: 0,
        academic: 0,
        general: 0,
      });
    } catch (err) {
      console.error('[PARENT-FEEDBACK] calculateStats - Fatal error:', err);
      // Return empty stats object if everything fails
      return {
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        behavioral: 0,
        academic: 0,
        general: 0,
      };
    }
  };

  const stats = calculateStats(feedbackData);

  // Filter feedback with improved null checks
  const filteredFeedback = feedbackData.filter(feedback => {
    try {
      // Log filter parameters for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[PARENT-FEEDBACK] Filtering item:', feedback.id, {
          searchQuery,
          selectedChild,
          selectedType,
          selectedSentiment
        });
      }
      
      // Add null checks for each property before calling toLowerCase
      const feedbackText = (feedback.comment || feedback.message || '').toLowerCase();
      const teacherName = (feedback.teacherName || '').toLowerCase();
      const courseName = (feedback.courseName || feedback.subject || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = 
        feedbackText.includes(query) ||
        teacherName.includes(query) ||
        courseName.includes(query);
      
      const matchesChild = selectedChild === "all" || feedback.studentId === selectedChild;
      
      // Handle missing properties safely with detailed logging for troubleshooting
      const feedbackType = feedback.type || feedback.category || 'general';
      if (process.env.NODE_ENV === 'development' && !feedback.type && !feedback.category) {
        console.log('[PARENT-FEEDBACK] Missing type/category for feedback:', feedback.id);
      }
      
      const matchesType = selectedType === "all" || feedbackType === selectedType;
      
      const feedbackSentiment = feedback.sentiment || 'neutral';
      if (process.env.NODE_ENV === 'development' && !feedback.sentiment) {
        console.log('[PARENT-FEEDBACK] Missing sentiment for feedback:', feedback.id);
      }
      
      const matchesSentiment = selectedSentiment === "all" || feedbackSentiment === selectedSentiment;
      
      return matchesSearch && matchesChild && matchesType && matchesSentiment;
    } catch (err) {
      // If an error occurs during filtering for a specific item, log it and exclude the item
      console.error('[PARENT-FEEDBACK] Error filtering feedback item:', feedback.id, err);
      return false;
    }
  });

  // Add debug logging to understand what we're getting
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && feedbackData.length > 0) {
      const sampleItem = feedbackData[0];
      console.log('[PARENT-FEEDBACK] Sample feedback structure:', {
        id: sampleItem.id,
        hasComment: !!sampleItem.comment,
        hasMessage: !!sampleItem.message,
        hasType: !!sampleItem.type,
        hasCategory: !!sampleItem.category,
        hasSentiment: !!sampleItem.sentiment
      });
    }
  }, [feedbackData]);

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Safely get the sentiment details with null checking
  const getSentimentDetails = (sentiment: TeacherFeedback["sentiment"]) => {
    // Default to neutral if sentiment is undefined
    const safeSentiment = sentiment || 'neutral';
    
    switch (safeSentiment) {
      case "positive":
        return { icon: ThumbsUp, color: "bg-green-100 text-green-800" };
      case "negative":
        return { icon: ThumbsDown, color: "bg-red-100 text-red-800" };
      case "neutral":
      default:
        return { icon: MessageCircle, color: "bg-gray-100 text-gray-800" };
    }
  };

  // Safely get the type color with null checking
  const getTypeColor = (type: TeacherFeedback["type"]) => {
    // Default to general if type is undefined
    const safeType = type || 'general';
    
    switch (safeType) {
      case "behavioral":
        return "bg-purple-100 text-purple-800";
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "general":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !feedbackData.length) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <ErrorBoundary>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Student Feedback</h1>
              <p className="text-sm text-gray-500">View and track your children's progress through teacher feedback</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Positive Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.positive}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({Math.round((stats.positive / stats.total) * 100)}%)
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Academic Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.academic}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Behavioral Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.behavioral}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Filters</CardTitle>
              <CardDescription>Refine the feedback list using the filters below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Child</label>
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Children</SelectItem>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback Type</label>
                  <Select 
                    value={selectedType} 
                    onValueChange={(value) => {
                      // Cast the value to the correct type
                      setSelectedType(value as typeof selectedType);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sentiment</label>
                  <Select 
                    value={selectedSentiment} 
                    onValueChange={(value) => {
                      // Cast the value to the correct type
                      setSelectedSentiment(value as typeof selectedSentiment);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sentiments</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <div className="space-y-4">
                {paginatedFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{feedback.studentName || 'Unknown Student'}</h3>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{feedback.courseName || feedback.subject || 'General'}</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {feedback.teacherName || 'Teacher'} • {
                              (() => {
                                try {
                                  // Safely format the date with error handling
                                  return format(new Date(feedback.date), "MMM d, yyyy");
                                } catch (err) {
                                  console.error(`[PARENT-FEEDBACK] Error formatting date for feedback ${feedback.id}:`, err);
                                  return 'Invalid date';
                                }
                              })()
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {(() => {
                            try {
                              return (
                                <Badge className={getTypeColor(feedback.type)}>
                                  {(feedback.type || feedback.category || 'general').charAt(0).toUpperCase() + 
                                   (feedback.type || feedback.category || 'general').slice(1)}
                                </Badge>
                              );
                            } catch (err) {
                              console.error(`[PARENT-FEEDBACK] Error rendering type badge for feedback ${feedback.id}:`, err);
                              return <Badge className="bg-gray-100 text-gray-800">General</Badge>;
                            }
                          })()}
                          {(() => {
                            try {
                              const sentimentDetails = getSentimentDetails(feedback.sentiment);
                              const Icon = sentimentDetails.icon;
                              return (
                                <Badge className={sentimentDetails.color}>
                                  <Icon className="h-3 w-3 mr-1" />
                                  {(feedback.sentiment || 'neutral').charAt(0).toUpperCase() + 
                                   (feedback.sentiment || 'neutral').slice(1)}
                                </Badge>
                              );
                            } catch (err) {
                              console.error(`[PARENT-FEEDBACK] Error rendering sentiment badge for feedback ${feedback.id}:`, err);
                              return <Badge className="bg-gray-100 text-gray-800">Neutral</Badge>;
                            }
                          })()}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-700">{feedback.comment || feedback.message || 'No content available'}</p>
                        {feedback.recommendations && (
                          <div className="mt-3 text-sm">
                            <span className="font-medium">Recommendations:</span>
                            <p className="text-gray-600">{feedback.recommendations}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewResponses(feedback)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" /> Responses
                        </Button>
                        {feedback.isRead === false && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsRead(feedback.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredFeedback.length > itemsPerPage && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFeedback.length)} of {filteredFeedback.length} results
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {filteredFeedback.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">No feedback found</h3>
                    <p className="mt-1 text-gray-500">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Distribution</CardTitle>
                    <CardDescription>Breakdown of feedback by type and sentiment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">By Type</h4>
                        <div className="space-y-2">
                          {["academic", "behavioral", "general"].map((type) => (
                            <div key={type} className="flex items-center">
                              <div className="flex-1">
                                <div className="text-sm">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                              </div>
                              <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    type === "academic" ? "bg-blue-500" :
                                    type === "behavioral" ? "bg-purple-500" : "bg-gray-500"
                                  }`}
                                  style={{
                                    width: `${Math.round((stats[type as keyof FeedbackStats] / stats.total) * 100)}%`
                                  }}
                                />
                              </div>
                              <div className="w-12 text-right text-sm">
                                {Math.round((stats[type as keyof FeedbackStats] / stats.total) * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">By Sentiment</h4>
                        <div className="space-y-2">
                          {["positive", "negative", "neutral"].map((sentiment) => (
                            <div key={sentiment} className="flex items-center">
                              <div className="flex-1">
                                <div className="text-sm">{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</div>
                              </div>
                              <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    sentiment === "positive" ? "bg-green-500" :
                                    sentiment === "negative" ? "bg-red-500" : "bg-gray-500"
                                  }`}
                                  style={{
                                    width: `${Math.round((stats[sentiment as keyof FeedbackStats] / stats.total) * 100)}%`
                                  }}
                                />
                              </div>
                              <div className="w-12 text-right text-sm">
                                {Math.round((stats[sentiment as keyof FeedbackStats] / stats.total) * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Trends</CardTitle>
                    <CardDescription>Feedback patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Chart component to be implemented
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Add response modal */}
          {selectedFeedback && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Feedback Details</h2>
                  <button 
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{selectedFeedback.studentName || 'Unknown Student'}</h3>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{selectedFeedback.courseName || selectedFeedback.subject || 'General'}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {selectedFeedback.teacherName || 'Teacher'} • {
                      (() => {
                        try {
                          return format(new Date(selectedFeedback.date), "MMM d, yyyy");
                        } catch (err) {
                          console.error(`[PARENT-FEEDBACK] Error formatting date in modal:`, err);
                          return 'Invalid date';
                        }
                      })()
                    }
                  </p>
                  <p className="mb-2">{selectedFeedback.comment || selectedFeedback.message || 'No content available'}</p>
                  {selectedFeedback.recommendations && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Recommendations:</p>
                      <p className="text-sm">{selectedFeedback.recommendations}</p>
                    </div>
                  )}
                </div>
                
                <h3 className="font-medium mb-2">Responses</h3>
                {error && (
                  <div className="p-3 mb-3 bg-red-50 border border-red-100 text-red-700 rounded-md">
                    <p className="text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => handleViewResponses(selectedFeedback)}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
                
                <div className="space-y-3 mb-4">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    </div>
                  ) : feedbackResponses.length === 0 ? (
                    <p className="text-gray-500 text-sm">No responses yet</p>
                  ) : (
                    feedbackResponses.map(response => (
                      <div key={response.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-sm">{response.responderName || response.senderName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{
                            (() => {
                              try {
                                return format(new Date(response.date), "MMM d, yyyy");
                              } catch (err) {
                                console.error(`[PARENT-FEEDBACK] Error formatting response date:`, err);
                                return 'Invalid date';
                              }
                            })()
                          }</p>
                        </div>
                        <p className="text-sm">{response.message || 'No message'}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Your Response</label>
                  <textarea 
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    disabled={loading}
                  ></textarea>
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSendResponse} 
                      disabled={loading || !responseText.trim()}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : "Send Response"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
}