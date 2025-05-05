import { useState, useMemo } from "react";
import { User } from "../../types/auth";
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { Download, Search, Book, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { Grade, ChildGradeStats } from "@/types/grades";

interface ParentGradesProps {
  user: User;
}

const GRADE_COLORS = {
  above90: "bg-green-100 text-green-800",
  above60: "bg-blue-100 text-blue-800",
  below60: "bg-red-100 text-red-800",
};

export default function ParentGrades({ user }: ParentGradesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [gradeThreshold, setGradeThreshold] = useState("all");

  // Mock grades data - would normally come from API
  const [grades] = useState<Grade[]>([
    {
      id: "g1",
      studentId: "s1",
      studentName: "John Doe",
      courseId: "c1",
      courseName: "Mathematics",
      grade: 85,
      date: "2024-01-15",
      teacher: "Mr. Smith",
      category: "Midterm",
      feedback: "Good work on problem solving"
    },
    {
      id: "g2",
      studentId: "s1",
      studentName: "John Doe",
      courseId: "c2",
      courseName: "Physics",
      grade: 92,
      date: "2024-01-20",
      teacher: "Mrs. Johnson",
      category: "Quiz",
      feedback: "Excellent understanding of concepts"
    },
    {
      id: "g3",
      studentId: "s2",
      studentName: "Jane Doe",
      courseId: "c1",
      courseName: "Mathematics",
      grade: 78,
      date: "2024-01-15",
      teacher: "Mr. Smith",
      category: "Midterm"
    }
  ]);

  // Memoized derived data
  const { children, courses } = useMemo(() => {
    const childrenMap = new Map<string, { id: string; name: string }>();
    const coursesMap = new Map<string, { id: string; name: string }>();
    
    grades.forEach(grade => {
      childrenMap.set(grade.studentId, { 
        id: grade.studentId, 
        name: grade.studentName 
      });
      coursesMap.set(grade.courseId, {
        id: grade.courseId,
        name: grade.courseName,
      });
    });

    return {
      children: Array.from(childrenMap.values()),
      courses: Array.from(coursesMap.values()),
    };
  }, [grades]);

  // Memoized filtered grades
  const filteredGrades = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return grades.filter(grade => {
      const matchesSearch = 
        grade.courseName.toLowerCase().includes(query) ||
        grade.studentName.toLowerCase().includes(query) ||
        grade.teacher.toLowerCase().includes(query) ||
        grade.feedback?.toLowerCase().includes(query);
      
      const matchesCourse = selectedCourse === "all" || grade.courseId === selectedCourse;
      const matchesChild = selectedChild === "all" || grade.studentId === selectedChild;
      const matchesThreshold = gradeThreshold === "all" || 
        (gradeThreshold === "above90" && grade.grade >= 90) ||
        (gradeThreshold === "below60" && grade.grade < 60);
      
      return matchesSearch && matchesCourse && matchesChild && matchesThreshold;
    });
  }, [grades, searchQuery, selectedCourse, selectedChild, gradeThreshold]);

  // Memoized child statistics
  const childrenStats = useMemo(() => 
    children.map(child => calculateChildStats(child, grades)), 
  [children, grades]);

  // Handle report download
  const handleDownloadReport = () => {
    console.log("Downloading grades report");
    // Implement actual download logic here
    alert("Grades report would be downloaded in a real application.");
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Children's Grades</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor your children's academic performance
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Download grades report"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {childrenStats.map((stats) => (
            <ChildGradeCard key={stats.studentId} stats={stats} />
          ))}
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap gap-4">
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search grades..."
          />
          <SelectFilter
            value={selectedChild}
            onChange={setSelectedChild}
            options={[
              { value: "all", label: "All Children" },
              ...children.map(c => ({ value: c.id, label: c.name }))
            ]}
            aria-label="Filter by child"
          />
          <SelectFilter
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={[
              { value: "all", label: "All Courses" },
              ...courses.map(c => ({ value: c.id, label: c.name }))
            ]}
            aria-label="Filter by course"
          />
          <SelectFilter
            value={gradeThreshold}
            onChange={setGradeThreshold}
            options={[
              { value: "all", label: "All Grades" },
              { value: "above90", label: "Above 90%" },
              { value: "below60", label: "Below 60%" },
            ]}
            aria-label="Filter by grade range"
          />
        </div>

        {/* Grade List */}
        <div className="space-y-4">
          {filteredGrades.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
              <p className="text-gray-500">No grades match your current filters</p>
            </div>
          ) : (
            filteredGrades.map((grade) => (
              <GradeCard key={grade.id} grade={grade} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Helper components

const ChildGradeCard = ({ stats }: { stats: ChildGradeStats }) => (
  <div className="rounded-lg border bg-white p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{stats.studentName}</h3>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Overall Average</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-blue-600">
            {stats.averageGrade.toFixed(1)}%
          </span>
          {stats.trendDirection !== "stable" && (
            <TrendIndicator 
              direction={stats.trendDirection}
              value={stats.trendValue}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <GradeMetric 
          label="Highest Grade" 
          value={stats.highestGrade} 
          type="positive" 
        />
        <GradeMetric 
          label="Lowest Grade" 
          value={stats.lowestGrade} 
          type="negative" 
        />
      </div>
      <CourseAverages courses={stats.courseAverages} />
    </div>
  </div>
);

const TrendIndicator = ({ direction, value }: { 
  direction: "up" | "down"; 
  value: number 
}) => (
  <div className={`flex items-center text-sm ${
    direction === "up" ? "text-green-600" : "text-red-600"
  }`}>
    {direction === "up" ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    )}
    <span className="ml-1">{value.toFixed(1)}%</span>
  </div>
);

const GradeMetric = ({ label, value, type }: { 
  label: string; 
  value: number;
  type: "positive" | "negative"; 
}) => (
  <div>
    <span className="text-gray-600">{label}</span>
    <div className={`font-semibold ${
      type === "positive" ? "text-green-600" : "text-red-600"
    }`}>
      {value}%
    </div>
  </div>
);

const CourseAverages = ({ courses }: { 
  courses: { courseName: string; average: number }[] 
}) => (
  <div className="border-t pt-4">
    <h4 className="text-sm font-medium text-gray-900 mb-2">Course Averages</h4>
    <div className="space-y-2">
      {courses.map((course, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-gray-600">{course.courseName}</span>
          <span className="font-medium text-gray-900">
            {course.average.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  </div>
);

const GradeCard = ({ grade }: { grade: Grade }) => {
  const gradeClass = grade.grade >= 90 ? GRADE_COLORS.above90 :
                   grade.grade >= 60 ? GRADE_COLORS.above60 :
                   GRADE_COLORS.below60;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`rounded-lg p-3 ${gradeClass}`}>
            <Book className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline flex-wrap gap-2">
              <h3 className="font-medium text-gray-900">{grade.studentName}</h3>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{grade.courseName}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>{grade.category}</span>
              <span>•</span>
              <span>{format(new Date(grade.date), "MMM d, yyyy")}</span>
              <span>•</span>
              <span>{grade.teacher}</span>
            </div>
            {grade.feedback && (
              <p className="mt-2 text-sm text-gray-600">
                Feedback: {grade.feedback}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${gradeClass}`}>
            {grade.grade}%
          </span>
        </div>
      </div>
    </div>
  );
};

const SearchInput = ({ value, onChange, placeholder }: { 
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search grades"
    />
  </div>
);

const SelectFilter = ({ 
  value, 
  onChange, 
  options, 
  "aria-label": ariaLabel 
}: { 
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  "aria-label": string;
}) => (
  <select
    className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={ariaLabel}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Helper functions

const calculateChildStats = (child: { id: string; name: string }, grades: Grade[]): ChildGradeStats => {
  const childGrades = grades.filter(g => g.studentId === child.id);
  const gradeValues = childGrades.map(g => g.grade);
  
  if (gradeValues.length === 0) {
    return {
      studentId: child.id,
      studentName: child.name,
      averageGrade: 0,
      totalAssessments: 0,
      highestGrade: 0,
      lowestGrade: 0,
      trendDirection: "stable",
      trendValue: 0,
      courseAverages: [],
    };
  }

  const averageGrade = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length;
  
  const courseAverages = Array.from(
    new Map(childGrades.map(g => [g.courseId, g.courseName])).entries()
  ).map(([courseId, courseName]) => ({
    courseName,
    average: childGrades
      .filter(g => g.courseId === courseId)
      .reduce((sum, g) => sum + g.grade, 0) / childGrades.filter(g => g.courseId === courseId).length
  }));

  // Mock trend calculation - replace with real data comparison
  const trendValue = Math.random() * 5 - 2.5;

  return {
    studentId: child.id,
    studentName: child.name,
    averageGrade,
    totalAssessments: childGrades.length,
    highestGrade: Math.max(...gradeValues),
    lowestGrade: Math.min(...gradeValues),
    trendDirection: trendValue > 0 ? "up" : trendValue < 0 ? "down" : "stable",
    trendValue: Math.abs(trendValue),
    courseAverages,
  };
};