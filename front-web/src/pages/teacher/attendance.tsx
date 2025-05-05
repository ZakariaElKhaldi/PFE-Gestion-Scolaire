import { useState, useEffect } from "react"
import { User } from "../../types/auth"
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import { AttendanceForm } from "../../components/dashboard/teacher/attendance-form"
import { Send, Sliders, Bell, XCircle, Download, BarChart2, CheckCircle, Clock, XCircle as X } from "lucide-react"
import { format } from "date-fns"
import { AttendanceService } from "../../services/attendance-service"
import { toastService } from "../../lib/toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Progress } from "../../components/ui/progress"
import { Badge } from "../../components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Skeleton } from "../../components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"

interface TeacherAttendanceProps {
  user: User
}

interface AttendanceStudent {
  id: string
  name: string
  status: 'present' | 'absent' | 'late' | 'excused'
  lastAttendance?: string
  totalPresent?: number
  totalAbsent?: number
  parentEmail?: string
  notes?: string
  attendanceId?: string
  timeIn?: string | null
  timeOut?: string | null
}

interface Class {
  id: string
  name: string
  students: { id: string; name: string }[]
}

interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

interface AttendanceSubmissionData {
  classId: string;
  date: string;
  attendance: Array<{
    studentId: string;
    status: AttendanceStudent['status'];
    notes?: string;
  }>;
}

const attendanceService = new AttendanceService();

export default function TeacherAttendance({ user }: TeacherAttendanceProps) {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<AttendanceStudent['status']>('present')
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    attendanceRate: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<AttendanceStudent[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // In a real implementation, this would fetch from the API
        setClasses([
    {
      id: 'math-101',
      name: 'Mathematics 101',
      students: [
        { id: '1', name: 'Alice Johnson' },
        { id: '2', name: 'Bob Smith' },
        { id: '3', name: 'Charlie Brown' }
      ]
    },
    {
      id: 'physics-201',
      name: 'Physics 201',
      students: [
        { id: '4', name: 'David Wilson' },
        { id: '5', name: 'Eve Anderson' }
      ]
    }
        ]);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        toastService.error('Failed to load classes');
      }
    };

    const fetchDashboardStats = async () => {
      setIsLoadingStats(true);
      try {
        const stats = await attendanceService.getTeacherDashboardStats();
        setDashboardStats(stats);
        // If we reach here, data was loaded successfully (or fallback data was used)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Show error toast - attendanceService already returns fallback data
        toastService.error('Could not load dashboard statistics. Using fallback data.');
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchClasses();
    fetchDashboardStats();
  }, []);

  // Fetch attendance data when class or date changes
  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendanceData();
    }
  }, [selectedClass, selectedDate]);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getClassAttendance(selectedClass, selectedDate);
      
      if (data && data.students) {
        setStudents(data.students);
        updateStats(data.students);
      } else {
        setStudents([]);
        resetStats();
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toastService.error('Failed to load attendance data');
      setStudents([]);
      resetStats();
    } finally {
      setIsLoading(false);
    }
  };

  const resetStats = () => {
    setStats({
      totalStudents: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      attendanceRate: 0
    });
  };

  const updateStats = (students: AttendanceStudent[]) => {
    const totalStudents = students.length;
    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.filter(s => s.status === 'absent').length;
    const lateCount = students.filter(s => s.status === 'late').length;
    const excusedCount = students.filter(s => s.status === 'excused').length;
    const attendanceRate = totalStudents > 0 
      ? ((presentCount + lateCount/2) / totalStudents * 100)
      : 0;

    setStats({
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate
    });
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleBulkStatusChange = async () => {
    if (!selectedStudents.length) {
      toastService.warning('No students selected');
      return;
    }

    setIsLoading(true);
    try {
      await attendanceService.submitBulkAttendance({
        classId: selectedClass,
        date: selectedDate,
        records: selectedStudents.map(id => ({
          studentId: id,
          status: bulkStatus,
          note: `Bulk status update to ${bulkStatus}`
        }))
      });
      
      // Refresh attendance data
      await fetchAttendanceData();
      
      setSelectedStudents([]);
      setShowBulkActions(false);
      toastService.success(`Successfully updated ${selectedStudents.length} students to ${bulkStatus}`);
    } catch (error) {
      console.error('Failed to update attendance:', error);
      toastService.error('Failed to update attendance status');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAttendanceSubmit = async (data: AttendanceSubmissionData) => {
    setIsLoading(true);
    try {
      await attendanceService.submitBulkAttendance({
        classId: data.classId,
        date: data.date,
        records: data.attendance
      });
      
      // Refresh attendance data
      await fetchAttendanceData();
      
      toastService.success('Attendance submitted successfully');
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      toastService.error('Failed to submit attendance');
    } finally {
      setIsLoading(false);
    }
  }

  const sendParentNotifications = async () => {
    if (!selectedClass || !selectedDate) {
      toastService.warning('Please select a class and date');
      return;
    }

    setIsLoading(true);
    try {
      const result = await attendanceService.notifyAbsentStudents(
        selectedClass,
        selectedDate,
        notificationMessage || 'Your child was marked absent today.'
      );

      setShowNotifyModal(false);
      setNotificationMessage('');
      
      if (result && result.notified) {
      toastService.success(`Successfully sent notifications to ${result.notified} parents`);
      } else {
        toastService.info('No notifications were sent');
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
      toastService.error('Failed to send parent notifications');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedClass) {
      toastService.warning('Please select a class');
      return;
    }

    setIsLoading(true);
    try {
      const report = await attendanceService.generateAttendanceReport({
        classId: selectedClass,
        startDate: selectedDate,
        endDate: selectedDate,
        format: 'pdf'
      });
      
      // Handle blob response
      const blob = new Blob([report], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${selectedDate}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toastService.success('Report generated and downloaded successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastService.error('Failed to generate attendance report');
    } finally {
      setIsLoading(false);
    }
  }

  const renderStudentList = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 py-3 border-b">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ));
    }

    if (!selectedClass) {
      return (
        <div className="py-8 text-center">
          <h3 className="text-lg font-medium">Select a class to view attendance</h3>
          <p className="text-sm text-muted-foreground mt-2">Choose a class from the dropdown above</p>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <div className="py-8 text-center">
          <h3 className="text-lg font-medium">No students found</h3>
          <p className="text-sm text-muted-foreground mt-2">There are no students in this class or attendance data is not available</p>
        </div>
      );
    }

    return students.map(student => (
      <div key={student.id} className="flex items-center justify-between py-3 border-b">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={selectedStudents.includes(student.id)}
            onChange={() => toggleStudentSelection(student.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://avatar.vercel.sh/${student.id}`} alt={student.name} />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-muted-foreground">
              {student.status === 'present' && (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" /> Present
                </span>
              )}
              {student.status === 'absent' && (
                <span className="flex items-center text-red-600">
                  <X className="h-3 w-3 mr-1" /> Absent
                </span>
              )}
              {student.status === 'late' && (
                <span className="flex items-center text-yellow-600">
                  <Clock className="h-3 w-3 mr-1" /> Late
                </span>
              )}
              {student.status === 'excused' && (
                <span className="flex items-center text-blue-600">
                  <XCircle className="h-3 w-3 mr-1" /> Excused
                </span>
              )}
              {student.notes && ` - ${student.notes}`}
            </div>
          </div>
        </div>
        <div>
          <Select
            value={student.status}
            onValueChange={(value: AttendanceStudent['status']) => {
              // Create an updated student list
              const updatedStudents = students.map(s => 
                s.id === student.id ? { ...s, status: value as AttendanceStudent['status'] } : s
              );
              
              // Update students and stats
              setStudents(updatedStudents);
              updateStats(updatedStudents);
              
              // Submit the change to the backend
              attendanceService.submitBulkAttendance({
                classId: selectedClass,
                date: selectedDate,
                records: [{
                  studentId: student.id,
                  status: value as AttendanceStudent['status'],
                  note: student.notes
                }]
              }).catch(error => {
                console.error('Failed to update attendance:', error);
                toastService.error('Failed to update attendance status');
                // Revert on error by refreshing data
                fetchAttendanceData();
              });
            }}
          >
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="excused">Excused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="space-y-6">
        {/* Header and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
                <Button
                  variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
                  className="flex items-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              Bulk Actions
                </Button>
                <Button
                  variant="outline"
              onClick={() => setShowNotifyModal(true)}
                  className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notify Parents
                </Button>
                <Button
                  variant="outline"
              onClick={handleGenerateReport}
                  className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Generate Report
                </Button>
          </div>
        </div>

            {/* Class Selection and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Class Selection</CardTitle>
                  <CardDescription>Select class and date to manage attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class-select">Class</Label>
                      <Select
                        value={selectedClass}
                        onValueChange={setSelectedClass}
                      >
                        <SelectTrigger id="class-select">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-select">Date</Label>
                      <Input
                        id="date-select"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Attendance Statistics</CardTitle>
                  <CardDescription>Daily attendance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Attendance Rate</span>
                        <span className="text-sm font-medium">{stats.attendanceRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={stats.attendanceRate} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-green-50 p-2 rounded-md text-center">
                        <div className="text-xs text-green-600 mb-1">Present</div>
                        <div className="text-xl font-bold text-green-700">{stats.presentCount}</div>
          </div>
                      <div className="bg-red-50 p-2 rounded-md text-center">
                        <div className="text-xs text-red-600 mb-1">Absent</div>
                        <div className="text-xl font-bold text-red-700">{stats.absentCount}</div>
          </div>
                      <div className="bg-yellow-50 p-2 rounded-md text-center">
                        <div className="text-xs text-yellow-600 mb-1">Late</div>
                        <div className="text-xl font-bold text-yellow-700">{stats.lateCount}</div>
          </div>
                      <div className="bg-blue-50 p-2 rounded-md text-center">
                        <div className="text-xs text-blue-600 mb-1">Excused</div>
                        <div className="text-xl font-bold text-blue-700">{stats.excusedCount}</div>
          </div>
          </div>
                  </div>
                </CardContent>
              </Card>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium">Bulk Actions</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedStudents.length} students selected
                      </p>
                    </div>
            <div className="flex items-center gap-4">
                      <Select
                value={bulkStatus}
                        onValueChange={(value: string) => setBulkStatus(value as AttendanceStudent['status'])}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleBulkStatusChange} disabled={isLoading}>
                        Apply
                      </Button>
                      <Button variant="outline" onClick={() => setShowBulkActions(false)}>
                        Cancel
                      </Button>
            </div>
          </div>
                </CardContent>
              </Card>
            )}

            {/* Student List */}
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription>
                  Manage attendance for each student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {renderStudentList()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{dashboardStats?.totalStudents || 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{dashboardStats?.presentToday || 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                  <X className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{dashboardStats?.absentToday || 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late Today</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{dashboardStats?.lateToday || 0}</div>
                  )}
                </CardContent>
              </Card>
              </div>
            
            {/* Attendance rate progress component */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Attendance Rate</CardTitle>
                <CardDescription>Overall attendance across all your classes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-4 w-full mb-2" />
                ) : (
                  <>
                    <Progress value={dashboardStats?.attendanceRate || 0} className="h-2" />
                    <div className="mt-2 text-sm text-muted-foreground">{dashboardStats?.attendanceRate || 0}% of students present</div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Class</CardTitle>
                <CardDescription>Overview of attendance rates across your classes</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardStats?.classesByAttendance ? (
              <div className="space-y-4">
                    {dashboardStats.classesByAttendance.map((cls: any) => (
                      <div key={cls.classId} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium">{cls.className}</span>
                            <Badge className="ml-2" variant="outline">{cls.studentCount} students</Badge>
                          </div>
                          <span className="text-sm font-medium">{cls.attendanceRate}%</span>
                        </div>
                        <Progress value={cls.attendanceRate} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <BarChart2 className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No attendance data available</h3>
                    <p className="text-xs text-muted-foreground mt-1">Statistics will appear once attendance is recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Notification Dialog */}
      <Dialog open={showNotifyModal} onOpenChange={setShowNotifyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify Parents of Absent Students</DialogTitle>
            <DialogDescription>
              Send notifications to parents of students marked as absent on {format(new Date(selectedDate), 'MMMM d, yyyy')}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                placeholder="Your child was marked absent today."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifyModal(false)}>Cancel</Button>
            <Button onClick={sendParentNotifications} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Notifications'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}