import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { StudentLayout } from '../../components/dashboard/layout/student-layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Download, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gradesService, CourseGrade, Grade } from '@/services/grades.service';

interface StudentGradesProps {
  user: User;
}

export default function StudentGrades({ user }: StudentGradesProps) {
  const [courses, setCourses] = useState<CourseGrade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const courseGrades = await gradesService.getGradesByCourse();
        setCourses(courseGrades);
      } catch (err) {
        console.error('Error fetching grades:', err);
        setError('Failed to load grades. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrades();
  }, []);

  const calculateGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateProgress = (score: number, total: number) => {
    return (score / total) * 100;
  };

  if (loading) {
    return (
      <StudentLayout user={user}>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-500">Loading your grades...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout user={user}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (courses.length === 0) {
    return (
      <StudentLayout user={user}>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No grades available</h3>
            <p className="mt-1 text-gray-500">You don't have any graded assignments yet.</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Performance</h1>
            <p className="text-sm text-gray-600 mt-1">Track your grades and academic progress</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{course.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${calculateGradeColor(course.currentGrade)}`}>
                      {course.currentGrade}%
                    </span>
                    {course.trend ? (
                      <div className={`flex items-center ${
                        course.trend.direction === 'up' 
                          ? 'text-green-600' 
                          : course.trend.direction === 'down' 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        {course.trend.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : course.trend.direction === 'down' ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                        <span className="text-xs ml-1">{course.trend.value > 0 ? course.trend.value : ''}%</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{course.teacher}</p>
                <Progress 
                  value={course.currentGrade}
                  className="h-2"
                />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <Tabs defaultValue={courses[0]?.id}>
            <TabsList className="grid grid-cols-3 gap-4">
              {courses.map((course) => (
                <TabsTrigger key={course.id} value={course.id} className="w-full">
                  {course.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {courses.map((course) => (
              <TabsContent key={course.id} value={course.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{course.name} - Grade Details</h3>
                    <span className={`text-lg font-bold ${calculateGradeColor(course.currentGrade)}`}>
                      Overall: {course.currentGrade}%
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium text-gray-500">Assignment</th>
                          <th className="text-left p-2 font-medium text-gray-500">Score</th>
                          <th className="text-left p-2 font-medium text-gray-500">Date</th>
                          <th className="text-left p-2 font-medium text-gray-500">Progress</th>
                          <th className="text-left p-2 font-medium text-gray-500">Comments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {course.grades.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500">
                              No grades available for this course yet.
                            </td>
                          </tr>
                        ) : (
                          course.grades.map((grade) => (
                            <tr key={grade.id}>
                              <td className="p-2 font-medium">{grade.assignmentTitle}</td>
                              <td className="p-2">
                                <span className={calculateGradeColor((grade.score / grade.totalPoints) * 100)}>
                                  {grade.score}/{grade.totalPoints}
                                </span>
                              </td>
                              <td className="p-2">{new Date(grade.gradedAt).toLocaleDateString()}</td>
                              <td className="p-2 w-32">
                                <Progress 
                                  value={calculateProgress(grade.score, grade.totalPoints)} 
                                  className="h-2"
                                />
                              </td>
                              <td className="p-2 text-sm text-gray-600">{grade.comments || 'No comments'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </StudentLayout>
  );
}