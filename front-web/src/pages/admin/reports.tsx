import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout'
import { UserResponse } from '../../types/auth'
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
  Download, 
  FileText, 
  Users, 
  GraduationCap, 
  BookOpen,
  Calendar,
  BarChart2,
  TrendingUp,
  Clock,
  Filter,
  ChevronDown
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

interface ReportsPageProps {
  user: UserResponse
}

// Sample data for reports
interface AcademicPerformance {
  department: string;
  avgGrade: number;
  passRate: number;
  attendanceRate: number;
}

interface EnrollmentTrend {
  year: string;
  students: number;
  growth: number;
}

interface DepartmentPerformance {
  name: string;
  performance: number;
  color: string;
}

interface TeacherEvaluation {
  name: string;
  department: string;
  rating: number;
  studentSatisfaction: number;
  courses: number;
}

export const ReportsPage = ({ user }: ReportsPageProps) => {
  const [activeTab, setActiveTab] = useState('academic');
  const [academicYear, setAcademicYear] = useState('2023-2024');
  const [reportPeriod, setReportPeriod] = useState('semester');

  // Sample data
  const academicPerformanceData: AcademicPerformance[] = [
    { department: 'Computer Science', avgGrade: 3.7, passRate: 92, attendanceRate: 88 },
    { department: 'Engineering', avgGrade: 3.5, passRate: 88, attendanceRate: 91 },
    { department: 'Business', avgGrade: 3.4, passRate: 90, attendanceRate: 85 },
    { department: 'Medicine', avgGrade: 3.8, passRate: 94, attendanceRate: 95 },
    { department: 'Arts & Humanities', avgGrade: 3.6, passRate: 91, attendanceRate: 82 },
    { department: 'Social Sciences', avgGrade: 3.5, passRate: 89, attendanceRate: 84 },
  ];

  const enrollmentTrends: EnrollmentTrend[] = [
    { year: '2018', students: 4200, growth: 0 },
    { year: '2019', students: 4500, growth: 7.1 },
    { year: '2020', students: 4850, growth: 7.8 },
    { year: '2021', students: 5300, growth: 9.3 },
    { year: '2022', students: 5800, growth: 9.4 },
    { year: '2023', students: 6250, growth: 7.8 },
  ];

  const departmentPerformance: DepartmentPerformance[] = [
    { name: 'Computer Science', performance: 92, color: '#0088FE' },
    { name: 'Engineering', performance: 88, color: '#00C49F' },
    { name: 'Business', performance: 85, color: '#FFBB28' },
    { name: 'Medicine', performance: 94, color: '#FF8042' },
    { name: 'Arts & Humanities', performance: 86, color: '#8884d8' },
  ];

  const teacherEvaluations: TeacherEvaluation[] = [
    { name: 'Dr. John Smith', department: 'Computer Science', rating: 4.8, studentSatisfaction: 92, courses: 3 },
    { name: 'Prof. Maria Garcia', department: 'Engineering', rating: 4.7, studentSatisfaction: 90, courses: 4 },
    { name: 'Dr. Robert Johnson', department: 'Business', rating: 4.6, studentSatisfaction: 88, courses: 3 },
    { name: 'Prof. Emily Chen', department: 'Medicine', rating: 4.9, studentSatisfaction: 95, courses: 2 },
    { name: 'Dr. James Williams', department: 'Arts & Humanities', rating: 4.5, studentSatisfaction: 87, courses: 5 },
  ];

  const attendanceData = [
    { name: 'Mon', present: 92, absent: 8 },
    { name: 'Tue', present: 88, absent: 12 },
    { name: 'Wed', present: 90, absent: 10 },
    { name: 'Thu', present: 87, absent: 13 },
    { name: 'Fri', present: 82, absent: 18 },
  ];

  const gradeDistribution = [
    { name: 'A', value: 35 },
    { name: 'B', value: 40 },
    { name: 'C', value: 15 },
    { name: 'D', value: 7 },
    { name: 'F', value: 3 },
  ];

  const reportTypes = [
    { icon: <Users className="h-5 w-5" />, name: 'Enrollment', description: 'Student enrollment statistics' },
    { icon: <GraduationCap className="h-5 w-5" />, name: 'Academic', description: 'Academic performance metrics' },
    { icon: <Clock className="h-5 w-5" />, name: 'Attendance', description: 'Student attendance records' },
    { icon: <TrendingUp className="h-5 w-5" />, name: 'Performance', description: 'Department performance analytics' },
    { icon: <BarChart2 className="h-5 w-5" />, name: 'Evaluation', description: 'Teacher evaluation feedback' },
    { icon: <BookOpen className="h-5 w-5" />, name: 'Curriculum', description: 'Curriculum effectiveness reports' },
  ];
  
  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reports Dashboard</h1>
          <div className="text-sm text-gray-600">
            Logged in as: {user.firstName} {user.lastName}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Report Generation</CardTitle>
                <CardDescription>Select parameters to generate reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <Select defaultValue={academicYear} onValueChange={setAcademicYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Academic Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2021-2022">2021-2022</SelectItem>
                        <SelectItem value="2022-2023">2022-2023</SelectItem>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <Select defaultValue={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Report Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semester">Semester</SelectItem>
                        <SelectItem value="quarter">Quarter</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="eng">Engineering</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="arts">Arts & Humanities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="flex-1 min-w-[140px]">
                    <FileText className="mr-2 h-4 w-4" /> Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Quick access to recent reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" /> Fall 2023 Academic Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" /> 2023 Enrollment Analysis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" /> Faculty Evaluation Summary
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {reportTypes.map((report, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    {report.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{report.name} Reports</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="academic" className="space-y-4">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold">Academic Performance by Department</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average GPA by Department</CardTitle>
                  <CardDescription>Academic year {academicYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={academicPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis domain={[0, 4]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgGrade" name="Average GPA" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pass Rate by Department</CardTitle>
                  <CardDescription>Academic year {academicYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={academicPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="passRate" name="Pass Rate (%)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Overall grade distribution across all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                        dataKey="value"
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Students']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detailed Academic Performance</CardTitle>
                <CardDescription>Comprehensive academic metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Average GPA</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {academicPerformanceData.map((dept, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{dept.avgGrade.toFixed(1)}</TableCell>
                        <TableCell>{dept.passRate}%</TableCell>
                        <TableCell>{dept.attendanceRate}%</TableCell>
                        <TableCell>
                          <Badge className={dept.passRate > 90 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {dept.passRate > 90 ? "Excellent" : "Good"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="enrollment" className="space-y-4">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold">Enrollment Trends</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Student Enrollment Over Time</CardTitle>
                <CardDescription>Five-year enrollment trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={enrollmentTrends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 15]} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="students" name="Total Students" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="growth" name="Growth (%)" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>New Student Intake</CardTitle>
                  <CardDescription>First-year student enrollment metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Total new students</p>
                        <p className="text-2xl font-bold">1,450</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">+12% from last year</Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Domestic students</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>International students</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Scholarship recipients</span>
                        <span className="font-medium">32%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "32%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment by Department</CardTitle>
                  <CardDescription>Current academic year distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentPerformance}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="performance"
                          nameKey="name"
                        >
                          {departmentPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Students']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="teacher" className="space-y-4">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold">Teacher Evaluation Reports</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Teacher Performance Ratings</CardTitle>
                <CardDescription>Based on student evaluations and peer reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Student Satisfaction</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherEvaluations.map((teacher, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{teacher.rating}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`h-4 w-4 ${i < Math.floor(teacher.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{teacher.studentSatisfaction}%</TableCell>
                        <TableCell>{teacher.courses}</TableCell>
                        <TableCell>
                          <Badge className={
                            teacher.rating >= 4.8 ? "bg-green-100 text-green-800" : 
                            teacher.rating >= 4.5 ? "bg-blue-100 text-blue-800" : 
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {teacher.rating >= 4.8 ? "Excellent" : teacher.rating >= 4.5 ? "Very Good" : "Good"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Effectiveness</CardTitle>
                  <CardDescription>Based on student learning outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={teacherEvaluations}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="studentSatisfaction" name="Student Satisfaction (%)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                  <CardDescription>Identified from student feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Course material clarity</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Assignment feedback quality</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Class engagement</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "92%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Availability for consultation</span>
                        <span className="font-medium">80%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold">Attendance Reports</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Overview</CardTitle>
                <CardDescription>Present vs. absent statistics for the current week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={attendanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" name="Present (%)" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="absent" name="Absent (%)" stackId="a" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-blue-600">87.8%</div>
                    <p className="text-sm text-gray-500">School-wide average</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">+2.3% from last month</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Perfect Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-green-600">512</div>
                    <p className="text-sm text-gray-500">Students with perfect attendance</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">18% of student body</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Attendance Concerns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-red-600">97</div>
                    <p className="text-sm text-gray-500">Students below 75% attendance</p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">Requires intervention</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Department</CardTitle>
                <CardDescription>Average attendance rates across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Average Attendance</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Perfect Attendance</TableHead>
                      <TableHead>Attendance Concerns</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {academicPerformanceData.map((dept, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{dept.attendanceRate}%</TableCell>
                        <TableCell>
                          {i % 2 === 0 ? 
                            <Badge className="bg-green-100 text-green-800">↑ 2.1%</Badge> : 
                            <Badge className="bg-red-100 text-red-800">↓ 1.3%</Badge>
                          }
                        </TableCell>
                        <TableCell>{Math.floor(Math.random() * 100) + 20} students</TableCell>
                        <TableCell>{Math.floor(Math.random() * 20) + 5} students</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};