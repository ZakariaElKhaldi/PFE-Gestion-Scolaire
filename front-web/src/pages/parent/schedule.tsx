import { useState } from "react";
import { UserResponse } from "../../types/auth";
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { Clock, MapPin } from "lucide-react";


interface ParentScheduleProps {
  user: UserResponse;
}

interface ClassSchedule {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  teacher: string;
  dayOfWeek: number; // 1-5 for Monday-Friday
  startTime: string;
  endTime: string;
  room: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export default function ParentSchedule({ user }: ParentScheduleProps) {
  const [selectedChild, setSelectedChild] = useState<string>("all");

  // Mock schedule data
  const [schedules] = useState<ClassSchedule[]>([
    {
      id: "s1",
      studentId: "st1",
      studentName: "John Smith",
      courseId: "c1",
      courseName: "Mathematics 101",
      teacher: "Mr. Anderson",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "10:30",
      room: "Room 101"
    },
    {
      id: "s2",
      studentId: "st1",
      studentName: "John Smith",
      courseId: "c2",
      courseName: "Physics 201",
      teacher: "Dr. Wilson",
      dayOfWeek: 1,
      startTime: "11:00",
      endTime: "12:30",
      room: "Lab 3"
    },
    {
      id: "s3",
      studentId: "st2",
      studentName: "Emma Smith",
      courseId: "c1",
      courseName: "Mathematics 101",
      teacher: "Mr. Anderson",
      dayOfWeek: 2,
      startTime: "09:00",
      endTime: "10:30",
      room: "Room 101"
    },
    {
      id: "s4",
      studentId: "st2",
      studentName: "Emma Smith",
      courseId: "c3",
      courseName: "Chemistry 101",
      teacher: "Dr. Brown",
      dayOfWeek: 3,
      startTime: "14:00",
      endTime: "15:30",
      room: "Lab 2"
    }
  ]);

  // Get unique children
  const children = Array.from(
    new Set(schedules.map(schedule => schedule.studentId))
  ).map(studentId => {
    const schedule = schedules.find(s => s.studentId === studentId);
    return {
      id: studentId,
      name: schedule?.studentName || ""
    };
  });

  // Filter schedules based on selected child
  const filteredSchedules = schedules.filter(schedule => 
    selectedChild === "all" || schedule.studentId === selectedChild
  );

  // Convert time string to hour number for positioning
  const getTimePosition = (time: string) => {
    const [hours] = time.split(":").map(Number);
    return hours - 8; // Offset from 8 AM
  };

  // Calculate class duration in hours
  const getClassDuration = (start: string, end: string) => {
    const [startHour] = start.split(":").map(Number);
    const [endHour] = end.split(":").map(Number);
    return endHour - startHour;
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Children's Schedule</h1>
            <p className="mt-1 text-sm text-gray-500">
              View your children's weekly class schedules
            </p>
          </div>
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            <option value="all">All Children</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="rounded-lg border bg-white">
          <div className="grid grid-cols-6 border-b">
            <div className="p-4 font-medium text-gray-500">Time</div>
            {daysOfWeek.map(day => (
              <div key={day} className="p-4 font-medium text-gray-900">{day}</div>
            ))}
          </div>
          <div className="relative grid grid-cols-6">
            {/* Time slots */}
            <div className="border-r">
              {timeSlots.map(hour => (
                <div key={hour} className="h-20 border-b p-2 text-sm text-gray-500">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Schedule grid */}
            {daysOfWeek.map((_, dayIndex) => (
              <div key={dayIndex} className="relative border-r">
                {timeSlots.map(hour => (
                  <div key={hour} className="h-20 border-b" />
                ))}
                {/* Classes for this day */}
                {filteredSchedules
                  .filter(schedule => schedule.dayOfWeek === dayIndex + 1)
                  .map(schedule => (
                    <div
                      key={schedule.id}
                      className="absolute left-0 right-0 m-1 rounded-lg bg-blue-50 p-2 shadow-sm"
                      style={{
                        top: `${getTimePosition(schedule.startTime) * 5}rem`,
                        height: `${getClassDuration(schedule.startTime, schedule.endTime) * 5}rem`
                      }}
                    >
                      <div className="flex h-full flex-col">
                        <div className="font-medium text-blue-700">
                          {schedule.courseName}
                        </div>
                        <div className="mt-1 text-xs text-blue-500">
                          {schedule.studentName}
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-xs text-blue-500">
                          <Clock className="h-3 w-3" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-500">
                          <MapPin className="h-3 w-3" />
                          {schedule.room}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* List View for Mobile */}
        <div className="block lg:hidden space-y-4">
          {children.map(child => (
            <div key={child.id} className="rounded-lg border bg-white p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{child.name}</h3>
              {daysOfWeek.map((day, dayIndex) => {
                const daySchedules = filteredSchedules.filter(
                  s => s.studentId === child.id && s.dayOfWeek === dayIndex + 1
                );
                if (daySchedules.length === 0) return null;
                return (
                  <div key={day} className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">{day}</h4>
                    <div className="space-y-2">
                      {daySchedules.map(schedule => (
                        <div key={schedule.id} className="rounded-lg bg-blue-50 p-3">
                          <div className="font-medium text-blue-700">
                            {schedule.courseName}
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-blue-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {schedule.room}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};