import { useState, useEffect } from "react";
import { User } from "../../../types/auth";
import { DashboardLayout } from "../../../components/dashboard/layout/dashboard-layout";
import { BarChart, TrendingUp, GraduationCap, BookOpen, Clock, Award, ChevronDown } from "lucide-react";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import axios from "axios";
import { API_URL } from "../../../config/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

interface ParentProgressProps {
  user: User;
}

interface ChildPerformanceData {
  subject: string;
  grade: number;
  gradeType: string;
}

interface ChildSkillData {
  skill: string;
  score: number;
}

interface Child {
  childId: string;
  name: string;
  performanceData: ChildPerformanceData[];
  skillsData: ChildSkillData[];
}

interface ApiResponse {
  children: Child[];
}

export default function ParentProgress({ user }: ParentProgressProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>(`${API_URL}/parent/progress`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setChildren(response.data.children);
        
        // Set the first child as selected by default if available
        if (response.data.children.length > 0) {
          setSelectedChildId(response.data.children[0].childId);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching children data:", err);
        setError("Failed to load children data. Please try again later.");
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  const handleChildChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChildId(event.target.value);
  };

  // Find the selected child
  const selectedChild = children.find(child => child.childId === selectedChildId);

  // Prepare chart data for the selected child
  const preparePerformanceData = (child?: Child) => {
    if (!child) return {
      labels: [],
      datasets: []
    };

    // Group performance data by subject
    const subjectGroups: Record<string, number[]> = {};
    
    child.performanceData.forEach(item => {
      if (!subjectGroups[item.subject]) {
        subjectGroups[item.subject] = [];
      }
      subjectGroups[item.subject].push(item.grade);
    });

    // Create datasets for each subject
    const datasets = Object.entries(subjectGroups).map(([subject, grades], index) => {
      const colors = [
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)'
      ];
      
      return {
        label: subject,
        data: grades,
        backgroundColor: colors[index % colors.length],
      };
    });

    // Use grade types as labels
    const labels = child.performanceData.map(item => item.gradeType);
    
    return {
      labels: [...new Set(labels)], // Remove duplicates
      datasets
    };
  };

  const prepareSkillsData = (child?: Child) => {
    if (!child) return {
      labels: [],
      datasets: []
    };

    return {
      labels: child.skillsData.map(item => item.skill),
      datasets: [
        {
          label: 'Skills',
          data: child.skillsData.map(item => item.score),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const performanceData = preparePerformanceData(selectedChild);
  const skillsData = prepareSkillsData(selectedChild);

  const performanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Academic Performance',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Grade',
        },
      },
    },
  };

  const skillsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Skills Assessment',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading progress data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center h-full">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center h-full">
          <div className="text-center">
            <p className="text-gray-600">No children data available.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Progress</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your children's academic performance
            </p>
          </div>
          <div className="relative">
            <label htmlFor="childSelect" className="sr-only">Select Child</label>
            <select
              id="childSelect"
              value={selectedChildId}
              onChange={handleChildChange}
              className="appearance-none w-48 px-4 py-2 pr-8 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-white text-gray-700"
            >
              {children.map(child => (
                <option key={child.childId} value={child.childId}>{child.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Overall GPA</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {selectedChild ? (
                (selectedChild.performanceData.reduce((sum, item) => sum + item.grade, 0) / 
                (selectedChild.performanceData.length || 1) / 20).toFixed(1)
              ) : "N/A"}
            </p>
            <p className="mt-1 text-sm text-gray-500">Current semester</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">95%</p>
            <p className="mt-1 text-sm text-gray-500">Academic year</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Subjects</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {selectedChild ? new Set(selectedChild.performanceData.map(item => item.subject)).size : 0}
            </p>
            <p className="mt-1 text-sm text-gray-500">Current semester</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Skills</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-600">
              {selectedChild ? selectedChild.skillsData.length : 0}
            </p>
            <p className="mt-1 text-sm text-gray-500">Tracked skills</p>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Academic Performance Chart */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              Academic Performance
            </h2>
            <div className="h-72">
              <Bar options={performanceOptions} data={performanceData} />
            </div>
          </div>

          {/* Skills Assessment Chart */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Skills Assessment
            </h2>
            <div className="h-72">
              <Radar data={skillsData} options={skillsOptions} />
            </div>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Subject Progress */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Subject Performance</h2>
              <span className="text-sm text-gray-500">Current Semester</span>
            </div>
            <div className="mt-4 space-y-4">
              {selectedChild && selectedChild.performanceData
                .filter((item, index, self) => 
                  index === self.findIndex(t => t.subject === item.subject)
                )
                .slice(0, 3)
                .map((item, index) => {
                  const subjectGrades = selectedChild.performanceData
                    .filter(grade => grade.subject === item.subject)
                    .map(grade => grade.grade);
                  
                  const averageGrade = subjectGrades.reduce((sum, grade) => sum + grade, 0) / 
                    (subjectGrades.length || 1);
                  
                  const getLetterGrade = (score: number) => {
                    if (score >= 90) return 'A';
                    if (score >= 80) return 'B';
                    if (score >= 70) return 'C';
                    if (score >= 60) return 'D';
                    return 'F';
                  };

                  const colors = ['blue', 'purple', 'green', 'yellow', 'red'];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={item.subject} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
                          <BookOpen className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.subject}</h3>
                          <p className="text-sm text-gray-500">{item.gradeType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-900">{getLetterGrade(averageGrade)}</span>
                        <p className="text-sm text-gray-500">{averageGrade.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              
              {(!selectedChild || selectedChild.performanceData.length === 0) && (
                <p className="text-gray-500 text-center py-4">No subject data available</p>
              )}
            </div>
          </div>

          {/* Skills Highlights */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Skills Highlights</h2>
              <span className="text-sm text-gray-500">Top Skills</span>
            </div>
            <div className="mt-4 space-y-4">
              {selectedChild && selectedChild.skillsData
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((skill, index) => {
                  const icons = [Award, TrendingUp, GraduationCap];
                  const colors = ['yellow', 'green', 'blue'];
                  const Icon = icons[index % icons.length];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={skill.skill} className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 text-${color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{skill.skill}</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div 
                            className={`bg-${color}-600 h-2.5 rounded-full`} 
                            style={{ width: `${skill.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <span className="font-semibold">{skill.score}%</span>
                      </div>
                    </div>
                  );
                })}
              
              {(!selectedChild || selectedChild.skillsData.length === 0) && (
                <p className="text-gray-500 text-center py-4">No skills data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}