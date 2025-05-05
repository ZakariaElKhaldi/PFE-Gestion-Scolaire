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
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TeacherLayout } from '../../components/dashboard/layout/teacher-layout';

interface TeacherScheduleProps {
  user: User;
}

// Sample data types
interface ClassSession {
  id: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  students: number;
  color: string;
}

interface UpcomingClass {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  students: number;
  color: string;
}

export const TeacherSchedule = ({ user }: TeacherScheduleProps) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [currentWeek] = useState('Nov 13 - Nov 19, 2023');
  
  // Sample data
  const weeklySchedule: ClassSession[] = [
    { id: 'cs101-1', title: 'Introduction to Computer Science', day: 'Monday', startTime: '09:00', endTime: '10:30', location: 'Room 101', students: 45, color: 'bg-blue-100 text-blue-800' },
    { id: 'cs101-2', title: 'Introduction to Computer Science', day: 'Wednesday', startTime: '09:00', endTime: '10:30', location: 'Room 101', students: 45, color: 'bg-blue-100 text-blue-800' },
    { id: 'cs101-3', title: 'Introduction to Computer Science', day: 'Friday', startTime: '09:00', endTime: '10:30', location: 'Room 101', students: 45, color: 'bg-blue-100 text-blue-800' },
    { id: 'cs301-1', title: 'Advanced Algorithms', day: 'Tuesday', startTime: '11:00', endTime: '12:30', location: 'Room 203', students: 28, color: 'bg-green-100 text-green-800' },
    { id: 'cs301-2', title: 'Advanced Algorithms', day: 'Thursday', startTime: '11:00', endTime: '12:30', location: 'Room 203', students: 28, color: 'bg-green-100 text-green-800' },
    { id: 'cs210-1', title: 'Data Structures', day: 'Monday', startTime: '14:00', endTime: '15:30', location: 'Room 105', students: 36, color: 'bg-purple-100 text-purple-800' },
    { id: 'cs210-2', title: 'Data Structures', day: 'Wednesday', startTime: '14:00', endTime: '15:30', location: 'Room 105', students: 36, color: 'bg-purple-100 text-purple-800' },
    { id: 'cs210-lab', title: 'Data Structures Lab', day: 'Friday', startTime: '14:00', endTime: '16:00', location: 'Lab 3', students: 36, color: 'bg-purple-100 text-purple-800' },
  ];
  
  const upcomingClasses: UpcomingClass[] = [
    { id: 'cs101-next', title: 'Introduction to Computer Science', date: 'Nov 13, 2023', startTime: '09:00', endTime: '10:30', location: 'Room 101', students: 45, color: 'bg-blue-100 text-blue-800' },
    { id: 'cs210-next', title: 'Data Structures', date: 'Nov 13, 2023', startTime: '14:00', endTime: '15:30', location: 'Room 105', students: 36, color: 'bg-purple-100 text-purple-800' },
    { id: 'cs301-next', title: 'Advanced Algorithms', date: 'Nov 14, 2023', startTime: '11:00', endTime: '12:30', location: 'Room 203', students: 28, color: 'bg-green-100 text-green-800' },
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const getClassesForDayAndTime = (day: string, time: string) => {
    return weeklySchedule.filter(
      cls => cls.day === day && 
      cls.startTime <= time && 
      time < cls.endTime
    );
  };
  
  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Teaching Schedule</h1>
          <div className="text-sm text-gray-600">
            Logged in as: {user.firstName} {user.lastName}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Your teaching schedule for the week
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{currentWeek}</span>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 gap-2">
                      {/* Time slots column */}
                      <div className="col-span-1">
                        <div className="h-12"></div> {/* Empty cell for header alignment */}
                        {timeSlots.map((time, index) => (
                          <div key={index} className="h-16 flex items-center justify-center text-sm text-gray-500">
                            {time}
                          </div>
                        ))}
                      </div>
                      
                      {/* Days columns */}
                      {days.slice(0, 7).map((day, dayIndex) => (
                        <div key={dayIndex} className="col-span-1">
                          <div className="h-12 flex items-center justify-center font-medium bg-gray-100 rounded-t-md">
                            {day}
                          </div>
                          {timeSlots.map((time, timeIndex) => {
                            const classes = getClassesForDayAndTime(day, time);
                            return (
                              <div key={timeIndex} className="h-16 border-t border-l border-r p-1 relative">
                                {classes.map((cls, clsIndex) => (
                                  <div 
                                    key={clsIndex} 
                                    className={`absolute inset-1 rounded p-1 ${cls.color} overflow-hidden text-xs`}
                                  >
                                    <div className="font-medium">{cls.title}</div>
                                    <div>{cls.startTime} - {cls.endTime}</div>
                                    <div>{cls.location}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-3">
                      <BookOpen className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{weeklySchedule.length}</div>
                      <div className="text-sm text-gray-500">Classes per week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Teaching Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-3">
                      <Clock className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">
                        {weeklySchedule.reduce((total, cls) => {
                          const start = parseInt(cls.startTime.split(':')[0]);
                          const end = parseInt(cls.endTime.split(':')[0]);
                          const duration = end - start + (cls.endTime.split(':')[1] === '30' ? 0.5 : 0) - (cls.startTime.split(':')[1] === '30' ? 0.5 : 0);
                          return total + duration;
                        }, 0)}
                      </div>
                      <div className="text-sm text-gray-500">Hours per week</div>
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
                    <div className="bg-purple-100 p-3 rounded-full mr-3">
                      <Users className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">
                        {Array.from(new Set(weeklySchedule.map(cls => cls.title))).reduce((total, title) => {
                          const uniqueClass = weeklySchedule.find(cls => cls.title === title);
                          return total + (uniqueClass?.students || 0);
                        }, 0)}
                      </div>
                      <div className="text-sm text-gray-500">Students taught</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>
                  Your next scheduled classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <div key={cls.id} className={`p-4 rounded-lg ${cls.color} flex items-start`}>
                      <div className="mr-4 bg-white bg-opacity-50 p-2 rounded">
                        <Calendar className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{cls.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{cls.date}, {cls.startTime} - {cls.endTime}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{cls.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{cls.students} Students</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-2">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  Monthly calendar view of your teaching schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Calendar View Coming Soon</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This section will be implemented in the next iteration with a full monthly calendar view of your teaching schedule.
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