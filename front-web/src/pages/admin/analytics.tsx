import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout';
import { UserResponse } from '../../types/auth';
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
  Users, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  Calendar, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Minus 
} from 'lucide-react';

interface AnalyticsPageProps {
  user: UserResponse;
}

export const AnalyticsPage = ({ user }: AnalyticsPageProps) => {
  const [timeRange, setTimeRange] = useState('month');

  // Mock data for enrollment statistics
  const enrollmentData = [
    { name: 'Jan', students: 120 },
    { name: 'Feb', students: 150 },
    { name: 'Mar', students: 180 },
    { name: 'Apr', students: 220 },
    { name: 'May', students: 250 },
    { name: 'Jun', students: 280 },
    { name: 'Jul', students: 260 },
    { name: 'Aug', students: 300 },
    { name: 'Sep', students: 340 },
    { name: 'Oct', students: 380 },
    { name: 'Nov', students: 400 },
    { name: 'Dec', students: 420 },
  ];

  // Mock data for course popularity
  const coursePopularityData = [
    { name: 'Mathematics', students: 320 },
    { name: 'Science', students: 280 },
    { name: 'Literature', students: 220 },
    { name: 'History', students: 190 },
    { name: 'Computer Science', students: 350 },
  ];

  // Mock data for revenue
  const revenueData = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 15000 },
    { name: 'Mar', revenue: 18000 },
    { name: 'Apr', revenue: 22000 },
    { name: 'May', revenue: 25000 },
    { name: 'Jun', revenue: 28000 },
    { name: 'Jul', revenue: 26000 },
    { name: 'Aug', revenue: 30000 },
    { name: 'Sep', revenue: 34000 },
    { name: 'Oct', revenue: 38000 },
    { name: 'Nov', revenue: 40000 },
    { name: 'Dec', revenue: 42000 },
  ];

  // Mock data for user distribution
  const userDistributionData = [
    { name: 'Students', value: 1200 },
    { name: 'Teachers', value: 80 },
    { name: 'Parents', value: 950 },
    { name: 'Administrators', value: 20 },
  ];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Mock data for key metrics
  const keyMetrics = [
    {
      title: 'Total Students',
      value: 1200,
      icon: Users,
      change: 8.5,
      changeType: 'increase',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Courses',
      value: 45,
      icon: BookOpen,
      change: 12.3,
      changeType: 'increase',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Graduation Rate',
      value: '92%',
      icon: GraduationCap,
      change: 3.2,
      changeType: 'increase',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Monthly Revenue',
      value: '$42,000',
      icon: DollarSign,
      change: 5.7,
      changeType: 'increase',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: '1',
      activity: 'New student registration',
      details: 'John Doe registered as a new student',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      activity: 'Course completion',
      details: '15 students completed "Introduction to Mathematics"',
      timestamp: '5 hours ago',
    },
    {
      id: '3',
      activity: 'Payment received',
      details: 'Received $1,200 for tuition fees',
      timestamp: '1 day ago',
    },
    {
      id: '4',
      activity: 'New course added',
      details: 'Added "Advanced Physics" to the curriculum',
      timestamp: '2 days ago',
    },
  ];

  // Function to render change indicator
  const renderChangeIndicator = (change: number, type: string) => {
    if (type === 'increase') {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span>{change}%</span>
        </div>
      );
    } else if (type === 'decrease') {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-3 w-3 mr-1" />
          <span>{change}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-600">
          <Minus className="h-3 w-3 mr-1" />
          <span>{change}%</span>
        </div>
      );
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                  <p className="text-2xl font-semibold">{metric.value}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">vs. previous period</div>
                {renderChangeIndicator(metric.change, metric.changeType)}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Enrollment Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Enrollment Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={enrollmentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#3B82F6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course Popularity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Course Popularity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={coursePopularityData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#8884D8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start border-b border-gray-100 pb-4">
                <div className="rounded-full bg-blue-100 p-2 mr-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{activity.activity}</h3>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <div className="text-sm text-gray-400 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Activities
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}; 