import { useState } from 'react';
import { GradeForm } from '../../components/dashboard/teacher/grade-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { User } from '../../types/auth';
import { FileDown, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import {
  FileText,
  Filter,
  CalendarDays,
  Users,
  BookOpen,
  Check,
  X,
  Download,
  Upload,
  BarChart3,
  Clock,
  AlertCircle,
  Ban
} from "lucide-react"

interface TeacherGradingPageProps {
  user: User;
}

interface GradeSubmissionData {
  studentId: string;
  subject: string;
  grade: string;
  examDate: string;
  comments?: string;
}

// Mock data
const mockStudents = [
  { id: 's1', name: 'John Doe' },
  { id: 's2', name: 'Jane Smith' },
  { id: 's3', name: 'Michael Johnson' },
  { id: 's4', name: 'Sarah Williams' },
  { id: 's5', name: 'David Brown' },
];

const mockSubjects = [
  { id: 'sub1', name: 'Mathematics' },
  { id: 'sub2', name: 'Science' },
  { id: 'sub3', name: 'History' },
  { id: 'sub4', name: 'English' },
  { id: 'sub5', name: 'Computer Science' },
];

const mockGrades = [
  { id: 'g1', studentId: 's1', studentName: 'John Doe', subject: 'Mathematics', grade: 85, date: '2025-02-15', comments: 'Good work' },
  { id: 'g2', studentId: 's2', studentName: 'Jane Smith', subject: 'Science', grade: 92, date: '2025-02-16', comments: 'Excellent' },
  { id: 'g3', studentId: 's3', studentName: 'Michael Johnson', subject: 'History', grade: 78, date: '2025-02-17', comments: 'Needs improvement' },
  { id: 'g4', studentId: 's4', studentName: 'Sarah Williams', subject: 'English', grade: 88, date: '2025-02-18', comments: 'Very good' },
  { id: 'g5', studentId: 's5', studentName: 'David Brown', subject: 'Computer Science', grade: 95, date: '2025-02-19', comments: 'Outstanding' },
];

export default function TeacherGradingPage({ user }: TeacherGradingPageProps) {
  const [grades, setGrades] = useState(mockGrades);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmitGrade = (data: GradeSubmissionData) => {
    // In a real app, this would send data to an API
    console.log('Submitting grade:', data);
    
    // Find the student name
    const student = mockStudents.find(s => s.id === data.studentId);
    const subject = mockSubjects.find(s => s.id === data.subject);
    
    // Create a new grade object
    const newGrade = {
      id: `g${grades.length + 1}`,
      studentId: data.studentId,
      studentName: student?.name || 'Unknown Student',
      subject: subject?.name || 'Unknown Subject',
      grade: parseFloat(data.grade),
      date: data.examDate,
      comments: data.comments || '',
    };
    
    // Add the new grade to the list
    setGrades([...grades, newGrade]);
    
    // Show success message
    setSuccessMessage(`Grade for ${student?.name} has been recorded successfully.`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const filteredGrades = grades.filter(grade => 
    grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportGrades = () => {
    // In a real app, this would generate a CSV or Excel file
    console.log('Exporting grades:', grades);
    alert('Grades exported successfully');
  };

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Grading Management</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        <Tabs defaultValue="enter-grades">
          <TabsList className="mb-6">
            <TabsTrigger value="enter-grades">Enter Grades</TabsTrigger>
            <TabsTrigger value="view-grades">View Grades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enter-grades">
            <GradeForm 
              students={mockStudents}
              subjects={mockSubjects}
              onSubmit={handleSubmitGrade}
            />
          </TabsContent>
          
          <TabsContent value="view-grades">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Grade Records</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students or subjects..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={exportGrades}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.studentName}</TableCell>
                        <TableCell>{grade.subject}</TableCell>
                        <TableCell>
                          <span className={
                            grade.grade >= 90 ? 'text-green-600 font-semibold' :
                            grade.grade >= 80 ? 'text-green-500' :
                            grade.grade >= 70 ? 'text-yellow-600' :
                            grade.grade >= 60 ? 'text-orange-500' : 'text-red-500'
                          }>
                            {grade.grade}%
                          </span>
                        </TableCell>
                        <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                        <TableCell>{grade.comments}</TableCell>
                      </TableRow>
                    ))}
                    {filteredGrades.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No grades found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
