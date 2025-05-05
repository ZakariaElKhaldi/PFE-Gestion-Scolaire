import { useState } from "react";
import { User } from "../../types/auth";
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { BarChart, TrendingUp, GraduationCap, BookOpen, Clock, Award, ChevronDown } from "lucide-react";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

interface ParentProgressProps {
  user: User;
}

interface ChildData {
  name: string;
  performanceData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  skillsData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
}

const childrenData: { [key: string]: ChildData } = {
  child1: {
    name: "John Doe",
    performanceData: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [
        {
          label: 'Mathematics',
          data: [85, 90, 78, 88, 92, 95, 89, 94, 91, 87, 93, 96],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Physics',
          data: [80, 85, 82, 86, 88, 90, 85, 89, 87, 84, 90, 92],
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        },
      ],
    },
    skillsData: {
      labels: ['Communication', 'Problem Solving', 'Teamwork', 'Creativity', 'Leadership', 'Technical Skills'],
      datasets: [
        {
          label: 'Skills',
          data: [85, 90, 78, 88, 92, 95],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    },
  },
  child2: {
    name: "Jane Doe",
    performanceData: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [
        {
          label: 'Mathematics',
          data: [78, 82, 85, 88, 90, 92, 94, 96, 89, 87, 85, 88],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Physics',
          data: [75, 80, 85, 88, 90, 92, 94, 96, 89, 87, 85, 88],
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        },
      ],
    },
    skillsData: {
      labels: ['Communication', 'Problem Solving', 'Teamwork', 'Creativity', 'Leadership', 'Technical Skills'],
      datasets: [
        {
          label: 'Skills',
          data: [80, 85, 88, 90, 92, 94],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    },
  },
};

const performanceOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Academic Performance Over the Year',
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
        text: 'Percentage',
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

export default function ParentProgress({ user }: ParentProgressProps) {
  const [selectedChild, setSelectedChild] = useState<string>("child1");

  const handleChildChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChild(event.target.value);
  };

  const { performanceData, skillsData } = childrenData[selectedChild];

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
              value={selectedChild}
              onChange={handleChildChange}
              className="appearance-none w-48 px-4 py-2 pr-8 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-white text-gray-700"
            >
              <option value="child1">John Doe</option>
              <option value="child2">Jane Doe</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Overall GPA</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">3.8</p>
            <p className="mt-1 text-sm text-gray-500">Current semester</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">95%</p>
            <p className="mt-1 text-sm text-gray-500">Academic year</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Completed Courses</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">12</p>
            <p className="mt-1 text-sm text-gray-500">Out of 15</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Awards</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-600">3</p>
            <p className="mt-1 text-sm text-gray-500">Academic achievements</p>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Mathematics</h3>
                    <p className="text-sm text-gray-500">Advanced Calculus</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">A</span>
                  <p className="text-sm text-gray-500">95%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Physics</h3>
                    <p className="text-sm text-gray-500">Classical Mechanics</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">A-</span>
                  <p className="text-sm text-gray-500">92%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
              <span className="text-sm text-gray-500">Last 30 days</span>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Perfect Attendance</h3>
                  <p className="text-sm text-gray-500">Achieved 100% attendance this month</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Top Performance</h3>
                  <p className="text-sm text-gray-500">Ranked 1st in Mathematics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}