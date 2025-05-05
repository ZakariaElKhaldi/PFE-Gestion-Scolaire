import { User } from '../../types/auth';
import { useState } from 'react';
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { Button } from '../../components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FileText, 
  Calendar, 
  Users, 
  BookOpen, 
  GraduationCap,
  ClipboardList
} from 'lucide-react';

interface TeacherReportsProps {
  user: User;
}

// Sample data types
interface ClassPerformance {
  className: string;
  averageGrade: number;
  passRate: number;
  attendanceRate: number;
  studentCount: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export const TeacherReports = ({ user }: TeacherReportsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data
  const classPerformance: ClassPerformance[] = [
    { className: 'Introduction to Computer Science', averageGrade: 82, passRate: 94, attendanceRate: 88, studentCount: 45 },
    { className: 'Advanced Algorithms', averageGrade: 78, passRate: 89, attendanceRate: 92, studentCount: 28 },
    { className: 'Data Structures', averageGrade: 80, passRate: 92, attendanceRate: 90, studentCount: 36 },
  ];

  const gradeDistribution: GradeDistribution[] = [
    { grade: 'A', count: 12, percentage: 27 },
    { grade: 'B', count: 18, percentage: 40 },
    { grade: 'C', count: 10, percentage: 22 },
    { grade: 'D', count: 4, percentage: 9 },
    { grade: 'F', count: 1, percentage: 2 },
  ];

  const monthlyAttendance = [
    { month: 'Sep', rate: 92 },
    { month: 'Oct', rate: 94 },
    { month: 'Nov', rate: 91 },
    { month: 'Dec', rate: 89 },
    { month: 'Jan', rate: 93 },
    { month: 'Feb', rate: 95 },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Teaching Reports</h1>
          <div className="text-sm text-gray-600">
            Logged in as: {user.firstName} {user.lastName}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Classes Taught</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-3">
                      <BookOpen className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{classPerformance.length}</div>
                      <div className="text-sm text-gray-500">Active classes this semester</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-3">
                      <Users className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">
                        {classPerformance.reduce((sum, cls) => sum + cls.studentCount, 0)}
                      </div>
                      <div className="text-sm text-gray-500">Students enrolled</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-3">
                      <Calendar className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">
                        {Math.round(classPerformance.reduce((sum, cls) => sum + cls.attendanceRate, 0) / classPerformance.length)}%
                      </div>
                      <div className="text-sm text-gray-500">Overall attendance rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Class Performance Overview</CardTitle>
                <CardDescription>
                  Summary of performance metrics across all classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={classPerformance}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="className" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="averageGrade" name="Average Grade" fill="#8884d8" />
                      <Bar dataKey="passRate" name="Pass Rate (%)" fill="#82ca9d" />
                      <Bar dataKey="attendanceRate" name="Attendance Rate (%)" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                  <CardDescription>
                    Monthly attendance rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyAttendance}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          name="Attendance Rate (%)"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>
                    Distribution of grades across all classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          nameKey="grade"
                        >
                          {gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Students']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>
                  Download detailed reports for your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Attendance Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Grade Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Student Performance Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Assignment Analysis Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>
                  Detailed attendance data for your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ClipboardList className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Attendance Tab Content</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This section will be implemented in the next iteration with detailed attendance tracking, charts, and student-specific attendance records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Reports</CardTitle>
                <CardDescription>
                  Comprehensive grade analysis for your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <GraduationCap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Grades Tab Content</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This section will be implemented in the next iteration with grade distributions, student performance tracking, and comparative analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Reports</CardTitle>
                <CardDescription>
                  Performance metrics for assignments and assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Assignments Tab Content</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This section will be implemented in the next iteration with assignment scores, completion rates, and difficulty analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};