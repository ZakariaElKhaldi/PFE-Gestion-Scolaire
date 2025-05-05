import { useState } from "react";
import { User } from "../../types/auth";
import { StudentLayout } from "../../components/dashboard/layout/student-layout";
import { Calendar as CalendarIcon, Search, Download, Clock, CheckCircle, XCircle, Filter } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay } from "date-fns";

interface StudentAttendanceProps {
  user: User;
}

interface AttendanceRecord {
  id: string;
  date: string;
  courseId: string;
  courseName: string;
  status: "present" | "absent" | "late" | "excused";
  timeIn?: string;
  timeOut?: string;
  notes?: string;
}

export default function StudentAttendance({ user }: StudentAttendanceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<AttendanceRecord["status"] | "all">("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  // Mock attendance data
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "a1",
      date: "2025-03-01",
      courseId: "c1",
      courseName: "Mathematics 101",
      status: "present",
      timeIn: "09:55",
      timeOut: "11:30",
      notes: "Participated actively in class discussion"
    },
    {
      id: "a2",
      date: "2025-03-04",
      courseId: "c2",
      courseName: "Physics 201",
      status: "late",
      timeIn: "14:15",
      timeOut: "15:45",
      notes: "Late due to traffic"
    },
    {
      id: "a3",
      date: "2025-03-05",
      courseId: "c1",
      courseName: "Mathematics 101",
      status: "absent",
      notes: "Medical appointment"
    },
    {
      id: "a4",
      date: "2025-03-06",
      courseId: "c3",
      courseName: "Computer Science",
      status: "excused",
      notes: "School event participation"
    }
  ]);

  // Get unique courses
  const courses = Array.from(
    new Map(attendanceRecords.map(record => [record.courseId, { id: record.courseId, name: record.courseName }])).values()
  );

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus;
    const matchesCourse = selectedCourse === "all" || record.courseId === selectedCourse;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Calculate attendance statistics
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === "present").length;
  const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
  const lateCount = attendanceRecords.filter(r => r.status === "late").length;
  const excusedCount = attendanceRecords.filter(r => r.status === "excused").length;
  const attendanceRate = (presentCount / totalClasses) * 100;

  // Get calendar days
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  });

  // Get status color
  const getStatusColor = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-100";
      case "absent":
        return "text-red-600 bg-red-100";
      case "late":
        return "text-yellow-600 bg-yellow-100";
      case "excused":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5" />;
      case "absent":
        return <XCircle className="h-5 w-5" />;
      case "late":
        return <Clock className="h-5 w-5" />;
      case "excused":
        return <CalendarIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  // Handle report download
  const handleDownloadReport = () => {
    // In a real application, this would generate and download a PDF report
    console.log("Downloading attendance report");
    alert("Attendance report would be downloaded in a real application.");
  };

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and track your attendance records
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        {/* Attendance Stats */}
        <div className="grid gap-6 md:grid-cols-5">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Classes</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{totalClasses}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Present</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">{presentCount}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Absent</h3>
            <p className="mt-2 text-3xl font-semibold text-red-600">{absentCount}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Late</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">{lateCount}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">{attendanceRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AttendanceRecord["status"] | "all")}
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        {/* Calendar View */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(selectedMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                className="rounded-md border px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setSelectedMonth(new Date())}
                className="rounded-md border px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                className="rounded-md border px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const dayAttendance = attendanceRecords.find(record => 
                isSameDay(new Date(record.date), day)
              );
              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square rounded-lg border p-2 ${
                    !isSameMonth(day, selectedMonth) ? "bg-gray-50" :
                    isToday(day) ? "border-blue-500" : ""
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {format(day, "d")}
                  </div>
                  {dayAttendance && (
                    <div className={`mt-1 rounded-full p-1 ${getStatusColor(dayAttendance.status)}`}>
                      {getStatusIcon(dayAttendance.status)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Records */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{record.courseName}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </span>
                      {record.timeIn && record.timeOut && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {record.timeIn} - {record.timeOut}
                        </span>
                      )}
                    </div>
                    {record.notes && (
                      <p className="mt-1 text-sm text-gray-600">{record.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}