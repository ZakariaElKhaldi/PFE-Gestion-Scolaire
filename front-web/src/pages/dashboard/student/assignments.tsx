import { useState, useEffect, useRef } from "react";
import { User } from "../../../types/auth";
import { StudentLayout } from "../../../components/dashboard/layout/student-layout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Calendar, Clock, FileText, Filter, Search, Upload, File } from "lucide-react";
import { assignmentService } from "../../../services/assignment.service";
import { toast } from "react-hot-toast";
import { AssignmentWithDetails } from "../../../types/assignment";

interface StudentAssignmentsProps {
  user: User;
}

// Create a specific interface for student assignments in this component
interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseName: string;
  courseCode: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  points?: number;
  score?: number;
  feedback?: string;
}

export default function StudentAssignments({ user }: StudentAssignmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentAssignment["status"] | "all">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        
        // Fetch assignments using assignment service
        const assignmentsData = await assignmentService.getUpcomingAssignments();
        
        // Fetch submissions to check status
        const submissions = await assignmentService.getMySubmissions();
        
        // Transform API data to match our StudentAssignment interface
        const transformedAssignments: StudentAssignment[] = assignmentsData.map((assignment: AssignmentWithDetails) => {
          // Check if this assignment has been submitted
          const submission = submissions.find(s => s.assignmentId === assignment.id);
          
          // Determine status based on submission
          let status: StudentAssignment["status"] = 'pending';
          if (submission) {
            status = submission.status as 'submitted' | 'graded' | 'late';
          } else if (new Date(assignment.dueDate) < new Date()) {
            status = 'late';
          }
          
          return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            courseName: assignment.course?.name || "",
            courseCode: assignment.course?.code || "",
            status,
            points: assignment.points,
            score: submission?.grade,
            feedback: submission?.feedback
          };
        });
        
        setAssignments(transformedAssignments);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
        toast.error("Failed to load assignments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    
    if (!selectedFile && !submissionContent.trim()) {
      toast.error("Please provide either a file or comments for your submission");
      return;
    }
    
    try {
      setSubmitting(true);
      await assignmentService.submitAssignment(selectedAssignment.id, { 
        file: selectedFile || undefined,
        comment: submissionContent 
      });
      
      // Update the assignment status in the local state
      setAssignments(prev => 
        prev.map(a => 
          a.id === selectedAssignment.id 
            ? { ...a, status: 'submitted' as const } 
            : a
        )
      );
      
      setSubmissionDialogOpen(false);
      setSubmissionContent("");
      setSelectedFile(null);
      toast.success("Assignment submitted successfully");
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter
    const matchesCourse = courseFilter === "all" || assignment.courseCode === courseFilter
    
    return matchesSearch && matchesStatus && matchesCourse
  });

  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseCode)));

  const getStatusColor = (status: StudentAssignment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "graded":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-red-100 text-red-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <StudentLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredAssignments.length} assignments • {filteredAssignments.filter(a => a.status === 'submitted' || a.status === 'graded').length} completed
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search assignments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <select
                className="h-10 rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StudentAssignment["status"] | "all")}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="late">Late</option>
              </select>
            </div>
            
            <div className="relative">
              <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <select
                className="h-10 rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            {filteredAssignments.filter(a => a.status === 'pending').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssignments
                  .filter(a => a.status === 'pending')
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map(assignment => (
                    <Card key={assignment.id} className={isOverdue(assignment.dueDate) ? "border-red-300" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge className={getStatusColor(isOverdue(assignment.dueDate) ? 'late' : 'pending')}>
                            {isOverdue(assignment.dueDate) ? 'Overdue' : 'Pending'}
                          </Badge>
                        </div>
                        <CardDescription>{assignment.courseCode} - {assignment.courseName}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm text-gray-700 line-clamp-3 mb-3">{assignment.description}</div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        {assignment.points && (
                          <div className="flex items-center text-sm text-gray-500">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Points: {assignment.points}</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setSubmissionDialogOpen(true);
                          }}
                          className="w-full"
                          variant={isOverdue(assignment.dueDate) ? "destructive" : "default"}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isOverdue(assignment.dueDate) ? 'Submit Late' : 'Submit'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No upcoming assignments</h3>
                <p className="mt-1 text-gray-500">You're all caught up!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="submitted" className="space-y-4">
            {filteredAssignments.filter(a => a.status === 'submitted').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssignments
                  .filter(a => a.status === 'submitted')
                  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                  .map(assignment => (
                    <Card key={assignment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge className={getStatusColor('submitted')}>
                            Submitted
                          </Badge>
                        </div>
                        <CardDescription>{assignment.courseCode} - {assignment.courseName}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm text-gray-700 line-clamp-3 mb-3">{assignment.description}</div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        {assignment.points && (
                          <div className="flex items-center text-sm text-gray-500">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Points: {assignment.points}</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            // Logic to view the submission details
                            // This could open a dialog showing the submission
                            setSelectedAssignment(assignment);
                            // You would need to implement a viewSubmissionDialog
                            // setViewSubmissionDialogOpen(true);
                          }}
                        >
                          <File className="h-4 w-4 mr-2" />
                          View Submission
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No submitted assignments</h3>
                <p className="mt-1 text-gray-500">You haven't submitted any assignments yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="graded" className="space-y-4">
            {filteredAssignments.filter(a => a.status === 'graded').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssignments
                  .filter(a => a.status === 'graded')
                  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                  .map(assignment => (
                    <Card key={assignment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge className={getStatusColor('graded')}>
                            Graded
                          </Badge>
                        </div>
                        <CardDescription>{assignment.courseCode} - {assignment.courseName}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm text-gray-700 line-clamp-3 mb-3">{assignment.description}</div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm font-medium">
                            Score: <span className="text-green-600">{assignment.score} / {assignment.points}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round((assignment.score || 0) / (assignment.points || 1) * 100)}%
                          </div>
                        </div>
                        {assignment.feedback && (
                          <div className="bg-gray-50 p-2 rounded text-sm mb-2">
                            <div className="font-medium mb-1">Feedback:</div>
                            <p className="text-gray-700">{assignment.feedback}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            // Logic to view the full submission and feedback
                            setSelectedAssignment(assignment);
                            // You would need to implement a viewGradedSubmissionDialog
                            // setViewGradedSubmissionDialogOpen(true);
                          }}
                        >
                          <File className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No graded assignments</h3>
                <p className="mt-1 text-gray-500">None of your submissions have been graded yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment && (
                <>
                  {selectedAssignment.title} - Due {formatDate(selectedAssignment.dueDate)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload File (Optional)
              </label>
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={triggerFileInput}
                  className="flex justify-center items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? "Change file" : "Select file"}
                </Button>
                
                {selectedFile && (
                  <div className="flex items-center p-2 rounded bg-muted">
                    <File className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm flex-1 truncate">
                      {selectedFile.name}
                    </span>
                    <Button 
                      onClick={removeSelectedFile} 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 rounded-full"
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Comments (Optional)
              </label>
              <Textarea
                placeholder="Add any comments about your submission..."
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setSubmissionDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAssignment}
              disabled={submitting || (!selectedFile && !submissionContent.trim())}
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Submitting...
                </>
              ) : (
                <>Submit</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}