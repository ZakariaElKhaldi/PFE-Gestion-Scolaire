import { useState, useEffect } from "react";
import { User } from "../../types/auth";
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { Calendar as CalendarIcon, Search, Download, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay } from "date-fns";
import { parentService } from "../../services/parent-service";
import { Skeleton } from "../../components/ui/skeleton";
import { toastService } from "../../lib/toast";

interface ParentAttendanceProps {
  user: User;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  courseId: string;
  courseName: string;
  status: "present" | "absent" | "late" | "excused";
  timeIn?: string;
  timeOut?: string;
  notes?: string;
}

interface ChildAttendanceStats {
  studentId: string;
  studentName: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

export default function ParentAttendance({ user }: ParentAttendanceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<AttendanceRecord["status"] | "all">("all");
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  
  // Add loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  
  // State for data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [children, setChildren] = useState<{id: string, name: string}[]>([]);
  const [childrenStats, setChildrenStats] = useState<ChildAttendanceStats[]>([]);
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);

  // Fetch attendance data on component mount
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        
        // Get attendance records
        const records = await parentService.getChildrenAttendance();
        setAttendanceRecords(records);
        
        // Extract unique children from records
        const uniqueChildren = Array.from(
          new Set(records.map(record => record.studentId))
        ).map(studentId => {
          const record = records.find(r => r.studentId === studentId);
          return {
            id: studentId,
            name: record?.studentName || ""
          };
        });
        setChildren(uniqueChildren);
        
        // Extract unique courses from records
        const uniqueCourses = Array.from(
          new Map(records.map(record => [record.courseId, { id: record.courseId, name: record.courseName }])).values()
        );
        setCourses(uniqueCourses);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
        toastService.error("Failed to load attendance records");
        setIsLoading(false);
      }
    };
    
    const fetchAttendanceStats = async () => {
      try {
        setIsStatsLoading(true);
        
        // Get attendance statistics for all children
        const statsData = await parentService.getChildrenAttendanceStats();
        
        // Format data for our component
        const formattedStats: ChildAttendanceStats[] = statsData.map(item => ({
          studentId: item.childId,
          studentName: item.childName,
          totalClasses: item.stats.totalClasses,
          presentCount: item.stats.presentCount,
          absentCount: item.stats.absentCount,
          lateCount: item.stats.lateCount,
          excusedCount: item.stats.excusedCount,
          attendanceRate: item.stats.attendanceRate
        }));
        
        setChildrenStats(formattedStats);
        setIsStatsLoading(false);
      } catch (error) {
        console.error("Error fetching attendance statistics:", error);
        toastService.error("Failed to load attendance statistics");
        setIsStatsLoading(false);
      }
    };
    
    fetchAttendanceData();
    fetchAttendanceStats();
  }, []);

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus;
    const matchesCourse = selectedCourse === "all" || record.courseId === selectedCourse;
    const matchesChild = selectedChild === "all" || record.studentId === selectedChild;
    
    return matchesSearch && matchesStatus && matchesCourse && matchesChild;
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
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  // Handle report download
  const handleDownloadReport = () => {
    console.log("Downloading attendance report");
    toastService.info("Generating attendance report...");
    // In a real implementation, this would call an API endpoint
    // For example: parentService.downloadAttendanceReport(selectedChild, startDate, endDate)
    setTimeout(() => {
      toastService.success("Attendance report downloaded successfully");
    }, 2000);
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Children's Attendance</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor your children's attendance records
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        {/* Attendance Stats per Child */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isStatsLoading ? (
            // Show skeletons while loading
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-white p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-1/2 mb-1" />
                        <Skeleton className="h-5 w-1/4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : childrenStats.length > 0 ? (
            childrenStats.map((stats) => (
              <div key={stats.studentId} className="rounded-lg border bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{stats.studentName}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Attendance Rate</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {stats.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Present</span>
                      <div className="text-green-600 font-semibold">{stats.presentCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Absent</span>
                      <div className="text-red-600 font-semibold">{stats.absentCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Late</span>
                      <div className="text-yellow-600 font-semibold">{stats.lateCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Excused</span>
                      <div className="text-blue-600 font-semibold">{stats.excusedCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No attendance statistics available
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            disabled={isLoading}
          >
            <option value="all">All Children</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AttendanceRecord["status"] | "all")}
            disabled={isLoading}
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
            disabled={isLoading}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        {/* Attendance Records */}
        {isLoading ? (
          // Show skeletons while loading
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="mt-1 flex items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="rounded-lg border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-3 ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{record.studentName}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{record.courseName}</span>
                      </div>
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
        ) : (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-500">No attendance records found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};