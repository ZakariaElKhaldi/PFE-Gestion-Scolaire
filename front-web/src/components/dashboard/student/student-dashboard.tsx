import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { PaymentForm } from '../../payment/PaymentForm';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Download, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  CreditCard,
  FileText,
  User,
  Bell
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { AIAssistantWidget } from '../AIAssistantWidget';

interface Grade {
  subject: string;
  grade: number;
  date: string;
  teacher: string;
  feedback?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  description: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

interface Schedule {
  day: string;
  periods: Array<{
    time: string;
    subject: string;
    teacher: string;
    room: string;
  }>;
}

interface StudentDashboardProps {
  studentName: string;
  grades: Grade[];
  assignments: Assignment[];
  schedule: Schedule[];
  onDownloadTranscript: () => void;
  onSubmitAssignment: (assignmentId: string, file: File) => void;
  onPaymentComplete: (paymentId: string) => void;
}

export function StudentDashboard({
  studentName,
  grades,
  assignments,
  schedule,
  onDownloadTranscript,
  onSubmitAssignment,
  onPaymentComplete,
}: StudentDashboardProps) {
  const calculateGPA = (grades: Grade[]) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  const handleFileUpload = (assignmentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSubmitAssignment(assignmentId, file);
    }
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  
  const gpa = calculateGPA(grades);
  const gpaPercentage = (parseFloat(gpa) / 4) * 100;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = schedule.find(s => s.day === today) || schedule[0];

  const sortedAssignments = [...assignments]
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const nextDueAssignment = sortedAssignments[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {studentName}</h1>
          <p className="text-gray-600">Here's an overview of your academic progress</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overall GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <div className="text-3xl font-bold">{gpa}</div>
              <div className="text-sm text-gray-500 ml-2 mb-1">/ 4.0</div>
            </div>
            <Progress value={gpaPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">{pendingAssignments.length}</div>
              <Badge variant="outline" className="ml-2">
                {pendingAssignments.length > 0 ? 'Action Needed' : 'All Done!'}
              </Badge>
            </div>
            {nextDueAssignment && (
              <p className="text-xs text-gray-500 mt-2">
                Next due: {new Date(nextDueAssignment.dueDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaySchedule.periods.length}</div>
            {todaySchedule.periods[0] && (
              <p className="text-xs text-gray-500 mt-2">
                Next: {todaySchedule.periods[0].subject} at {todaySchedule.periods[0].time.split(' - ')[0]}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              onClick={() => document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Today's Schedule</CardTitle>
              <Button variant="link" onClick={() => document.getElementById('schedule-tab')?.click()}>
                View Full Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todaySchedule.periods.map((period, i) => (
                  <div key={i} className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="w-20 text-sm font-medium">{period.time.split(' - ')[0]}</div>
                    <div className="flex-1 ml-4">
                      <div className="font-medium">{period.subject}</div>
                      <div className="text-sm text-gray-500">{period.teacher} • {period.room}</div>
                    </div>
                    <Badge variant="outline">{period.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <AIAssistantWidget />
        </div>
      </div>

      <Tabs defaultValue="grades" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grades" id="grades-tab">
            <TrendingUp className="h-4 w-4 mr-2" />
            Grades
          </TabsTrigger>
          <TabsTrigger value="assignments" id="assignments-tab">
            <BookOpen className="h-4 w-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="schedule" id="schedule-tab">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="payments" id="payments-tab">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>Track your grades and academic progress</CardDescription>
              </div>
              <Button variant="outline" onClick={onDownloadTranscript}>
                <Download className="h-4 w-4 mr-2" />
                Download Transcript
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Grade Average</h3>
                        <p className="text-3xl font-bold mt-2">{calculateGPA(grades)}%</p>
                      </div>
                      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Last Grade</h3>
                        <p className="text-3xl font-bold mt-2">
                          {grades.length > 0 ? grades[0].grade : 'N/A'}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {grades.length > 0 ? grades[0].subject : ''}
                        </p>
                      </div>
                      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{grade.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 
                              ${grade.grade >= 90 ? 'bg-green-100 text-green-800' : 
                                grade.grade >= 80 ? 'bg-blue-100 text-blue-800' : 
                                grade.grade >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}
                          >
                            {grade.grade}
                          </div>
                          <Progress value={grade.grade} className="w-24 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                      <TableCell>{grade.teacher}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={grade.feedback || ''}>
                          {grade.feedback || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Assignments</CardTitle>
                  <CardDescription>Track your homework and project deadlines</CardDescription>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Badge variant="outline">{pendingAssignments.length} Pending</Badge>
                  <Badge variant="outline">
                    {assignments.filter(a => a.status === 'submitted').length} Submitted
                  </Badge>
                  <Badge variant="outline">
                    {assignments.filter(a => a.status === 'graded').length} Graded
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const isPastDue = new Date(assignment.dueDate) < new Date() && assignment.status === 'pending';
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="font-medium">{assignment.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-md" title={assignment.description}>
                            {assignment.description}
                          </div>
                        </TableCell>
                        <TableCell>{assignment.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                            {isPastDue && (
                              <Badge variant="destructive" className="ml-2">Overdue</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              assignment.status === 'graded' ? 'bg-green-100 text-green-800 border-green-200' :
                              assignment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                              'bg-blue-100 text-blue-800 border-blue-200'
                            }
                          >
                            {assignment.status === 'graded' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {assignment.status === 'submitted' && <Clock className="h-3 w-3 mr-1" />}
                            {assignment.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </Badge>
                          {assignment.grade && (
                            <div className="text-sm font-medium mt-1">
                              Grade: {assignment.grade}%
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {assignment.status === 'pending' && (
                            <div>
                              <input
                                type="file"
                                id={`file-${assignment.id}`}
                                className="hidden"
                                onChange={(e) => handleFileUpload(assignment.id, e)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`file-${assignment.id}`)?.click()}
                                className="w-full"
                              >
                                Submit
                              </Button>
                            </div>
                          )}
                          {assignment.status === 'submitted' && (
                            <Badge variant="outline" className="bg-green-50">Awaiting Grade</Badge>
                          )}
                          {assignment.status === 'graded' && (
                            <Button variant="ghost" size="sm" className="w-full">View Feedback</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Class Schedule</CardTitle>
                  <CardDescription>Your weekly class timetable</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex overflow-x-auto">
                <div className="min-w-full grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-200">
                  {schedule.map((day, index) => (
                    <div key={index} className={`p-4 ${day.day === today ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-center mb-4">
                        <h3 className="font-semibold text-lg">{day.day}</h3>
                        {day.day === today && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">Today</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {day.periods.map((period, i) => (
                          <div 
                            key={i} 
                            className="p-3 rounded-md border border-gray-200 bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="bg-gray-50">
                                {period.time}
                              </Badge>
                              <div className="text-sm text-gray-500">{period.room}</div>
                            </div>
                            <div className="font-medium">{period.subject}</div>
                            <div className="text-sm text-gray-500">{period.teacher}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" id="payment-section">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Payments & Finances</CardTitle>
                  <CardDescription>Manage your tuition and fees</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-500">Current Balance</h3>
                        <p className="text-3xl font-bold mt-2">$1,250.00</p>
                      </div>
                      <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-500">Payment Due</h3>
                        <p className="text-3xl font-bold mt-2">Mar 15, 2025</p>
                      </div>
                      <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-500">Payment Plan</h3>
                        <p className="text-xl font-bold mt-2">Monthly Plan</p>
                        <Badge variant="outline" className="mt-1">4 payments remaining</Badge>
                      </div>
                      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <h3 className="font-medium mb-2">Make a Payment</h3>
                <div className="w-full md:w-2/3 mx-auto bg-white rounded-md p-4 border border-gray-200">
                  <PaymentForm onComplete={onPaymentComplete} />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Payment History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Feb 15, 2025</TableCell>
                      <TableCell>Tuition Payment - Spring Semester</TableCell>
                      <TableCell>$1,250.00</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jan 15, 2025</TableCell>
                      <TableCell>Tuition Payment - Spring Semester</TableCell>
                      <TableCell>$1,250.00</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
