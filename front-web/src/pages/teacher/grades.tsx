import { useState } from "react";
import { User } from "../../types/auth";
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { Search, Download, Save, BookOpen, GraduationCap, AlertCircle } from "lucide-react";

interface TeacherGradesProps {
  user: User;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  currentGrade?: number;
  assignments: {
    id: string;
    name: string;
    score?: number;
    maxScore: number;
    weight: number;
  }[];
}

interface Class {
  id: string;
  name: string;
  subject: string;
  gradeScale: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  students: Student[];
}

export default function TeacherGrades({ user }: TeacherGradesProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  // Mock class data
  const classes: Class[] = [
    {
      id: "c1",
      name: "Mathematics 101",
      subject: "Mathematics",
      gradeScale: { A: 90, B: 80, C: 70, D: 60 },
      students: [
        {
          id: "s1",
          name: "John Smith",
          rollNumber: "2025001",
          assignments: [
            { id: "a1", name: "Midterm Exam", maxScore: 100, weight: 0.3 },
            { id: "a2", name: "Final Exam", maxScore: 100, weight: 0.4 },
            { id: "a3", name: "Homework", maxScore: 100, weight: 0.3 }
          ]
        },
        {
          id: "s2",
          name: "Emma Johnson",
          rollNumber: "2025002",
          assignments: [
            { id: "a1", name: "Midterm Exam", maxScore: 100, weight: 0.3 },
            { id: "a2", name: "Final Exam", maxScore: 100, weight: 0.4 },
            { id: "a3", name: "Homework", maxScore: 100, weight: 0.3 }
          ]
        }
      ]
    },
    {
      id: "c2",
      name: "Physics 201",
      subject: "Physics",
      gradeScale: { A: 90, B: 80, C: 70, D: 60 },
      students: [
        {
          id: "s3",
          name: "Michael Brown",
          rollNumber: "2025003",
          assignments: [
            { id: "a1", name: "Lab Report 1", maxScore: 100, weight: 0.25 },
            { id: "a2", name: "Lab Report 2", maxScore: 100, weight: 0.25 },
            { id: "a3", name: "Final Project", maxScore: 100, weight: 0.5 }
          ]
        }
      ]
    }
  ];

  const selectedClassData = classes.find(c => c.id === selectedClass);

  const filteredStudents = selectedClassData?.students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const calculateFinalGrade = (studentId: string) => {
    if (!selectedClassData || !grades[studentId]) return null;

    const student = selectedClassData.students.find(s => s.id === studentId);
    if (!student) return null;

    let weightedSum = 0;
    let totalWeight = 0;

    student.assignments.forEach(assignment => {
      const score = grades[studentId][assignment.id];
      if (score !== undefined) {
        weightedSum += (score / assignment.maxScore) * assignment.weight;
        totalWeight += assignment.weight;
      }
    });

    if (totalWeight === 0) return null;
    return (weightedSum / totalWeight) * 100;
  };

  const getLetterGrade = (score: number) => {
    if (!selectedClassData) return "";
    const { gradeScale } = selectedClassData;
    
    if (score >= gradeScale.A) return "A";
    if (score >= gradeScale.B) return "B";
    if (score >= gradeScale.C) return "C";
    if (score >= gradeScale.D) return "D";
    return "F";
  };

  const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assignmentId]: numValue
      }
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setComments(prev => ({
      ...prev,
      [studentId]: comment
    }));
  };

  const handleSaveGrades = () => {
    // In a real application, this would save the grades to a backend
    console.log("Saving grades:", { grades, comments });
    alert("Grades saved successfully!");
  };

  const handleDownloadReport = () => {
    // In a real application, this would generate and download a PDF report
    console.log("Downloading grades report");
    alert("Grades report would be downloaded in a real application.");
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter and manage student grades for your classes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveGrades}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              disabled={!selectedClass}
            >
              <Save className="h-4 w-4" />
              Save Grades
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Class Selection and Search */}
        <div className="flex gap-4">
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Selected Class Info */}
        {selectedClassData && (
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedClassData.name}</h2>
                <p className="text-sm text-gray-500">{selectedClassData.subject}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {selectedClassData.students.length} Students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">
                    Grade Scale: A≥{selectedClassData.gradeScale.A}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grades Table */}
        {selectedClassData && (
          <div className="rounded-lg border bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  {selectedClassData.students[0].assignments.map(assignment => (
                    <th key={assignment.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {assignment.name}
                      <br />
                      <span className="text-gray-400">({assignment.weight * 100}%)</span>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const finalGrade = calculateFinalGrade(student.id);
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.rollNumber}</div>
                        </div>
                      </td>
                      {student.assignments.map(assignment => (
                        <td key={assignment.id} className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max={assignment.maxScore}
                            className="w-20 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={grades[student.id]?.[assignment.id] || ""}
                            onChange={(e) => handleGradeChange(student.id, assignment.id, e.target.value)}
                          />
                          <span className="ml-1 text-sm text-gray-500">
                            /{assignment.maxScore}
                          </span>
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        {finalGrade !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {finalGrade.toFixed(1)}%
                            </span>
                            <span className={`rounded-full px-2 py-1 text-sm font-medium ${
                              finalGrade >= selectedClassData.gradeScale.A ? "bg-green-100 text-green-800" :
                              finalGrade >= selectedClassData.gradeScale.B ? "bg-blue-100 text-blue-800" :
                              finalGrade >= selectedClassData.gradeScale.C ? "bg-yellow-100 text-yellow-800" :
                              finalGrade >= selectedClassData.gradeScale.D ? "bg-orange-100 text-orange-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {getLetterGrade(finalGrade)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Add comments..."
                          className="w-full rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={comments[student.id] || ""}
                          onChange={(e) => handleCommentChange(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!selectedClass && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Class Selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a class to start managing grades
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
