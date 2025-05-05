import { useState, useMemo, useCallback, useEffect } from 'react';
import { User } from '../../types/auth';
import { StudentLayout } from '../../components/dashboard/layout/student-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User as UserIcon, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ScheduleEvent } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentScheduleProps {
  user: User;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const START_HOUR = 8;
const END_HOUR = 18;

type ViewMode = 'week' | 'day';

export default function StudentSchedule({ user }: StudentScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);

  // Add console log to indicate component mount
  useEffect(() => {
    console.log('Student Schedule component mounted - Schedule view is now active');
  }, []);

  // Helper function to get current week's Monday
  const getCurrentWeekMonday = useCallback((date: Date, offset = 0): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7); // Adjust for Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  // Current week dates
  const weekDates = useMemo(() => {
    const monday = getCurrentWeekMonday(selectedDate, weekOffset);
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }, [selectedDate, weekOffset, getCurrentWeekMonday]);

  // Reset week offset when date is directly selected
  useEffect(() => {
    setWeekOffset(0);
  }, [selectedDate]);

  // Memoized schedule data - enhanced with more realistic data
  const scheduleEvents = useMemo<ScheduleEvent[]>(() => [
    {
      id: '1',
      title: 'Mathematics',
      teacher: 'Mr. Anderson',
      startTime: '08:00',
      endTime: '09:30',
      location: 'Room 101',
      dayOfWeek: 1,
      color: 'blue',
    },
    {
      id: '2',
      title: 'Physics',
      teacher: 'Dr. Johnson',
      startTime: '10:00',
      endTime: '11:30',
      location: 'Lab 203',
      dayOfWeek: 1,
      color: 'green',
    },
    {
      id: '3',
      title: 'English Literature',
      teacher: 'Ms. Parker',
      startTime: '13:00',
      endTime: '14:30',
      location: 'Room 105',
      dayOfWeek: 2,
      color: 'purple',
    },
    {
      id: '4',
      title: 'Computer Science',
      teacher: 'Prof. Williams',
      startTime: '15:00',
      endTime: '16:30',
      location: 'Lab 302',
      dayOfWeek: 3,
      color: 'orange',
    },
    {
      id: '5',
      title: 'History',
      teacher: 'Dr. Thompson',
      startTime: '09:00',
      endTime: '10:30',
      location: 'Room 201',
      dayOfWeek: 4,
      color: 'red',
    },
    {
      id: '6',
      title: 'Art & Design',
      teacher: 'Ms. Rodriguez',
      startTime: '14:00',
      endTime: '15:30',
      location: 'Art Studio',
      dayOfWeek: 5,
      color: 'pink',
    },
  ], []);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour !== END_HOUR) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  }, []);

  // Memoized event getter - improved to handle duration
  const getEventsForTimeSlot = useCallback((day: number, time: string) => {
    // Check for events that are occurring during this time slot
    return scheduleEvents.filter(event => {
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      const eventStartMinute = parseInt(event.startTime.split(':')[1]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      const eventEndMinute = parseInt(event.endTime.split(':')[1]);
      
      const timeHour = parseInt(time.split(':')[0]);
      const timeMinute = parseInt(time.split(':')[1]);
      
      const eventStart = eventStartHour * 60 + eventStartMinute;
      const eventEnd = eventEndHour * 60 + eventEndMinute;
      const timeSlotStart = timeHour * 60 + timeMinute;
      const timeSlotEnd = timeSlotStart + 30; // Each slot is 30 minutes
      
      return event.dayOfWeek === day && 
             eventStart < timeSlotEnd && 
             eventEnd > timeSlotStart &&
             eventStart <= timeSlotStart; // Only count events starting at or before this slot
    });
  }, [scheduleEvents]);

  // Calculate event duration in 30-min slots
  const getEventDuration = useCallback((event: ScheduleEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinute = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinute = parseInt(event.endTime.split(':')[1]);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    const durationInMinutes = endInMinutes - startInMinutes;
    
    return Math.ceil(durationInMinutes / 30); // Convert to 30-min slots, rounding up
  }, []);

  // Navigate between weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekOffset(prev => prev + (direction === 'next' ? 1 : -1));
  };

  // Get day number from date for filtering events
  const getDayNumberFromDate = (date: Date) => {
    const day = date.getDay();
    return day === 0 ? 7 : day; // Convert Sunday (0) to 7, Monday (1) stays 1, etc.
  };

  // Format date header for the schedule
  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
            <p className="text-sm text-gray-600 mt-1">
              {viewMode === 'week' 
                ? `Week of ${weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekDates[4].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                : selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="day">Day View</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateWeek('prev')}
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateWeek('next')}
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(300px,350px)_1fr] gap-6">
          <div className="space-y-4 w-full">
            <WeekSelector 
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              weekDates={weekDates}
            />
            
            <UpcomingEvents events={scheduleEvents} />
          </div>
          
          {viewMode === 'week' ? (
            <ScheduleTable
              daysOfWeek={DAYS_OF_WEEK}
              timeSlots={timeSlots}
              getEvents={getEventsForTimeSlot}
              getEventDuration={getEventDuration}
              weekDates={weekDates}
            />
          ) : (
            <DailySchedule
              selectedDate={selectedDate}
              events={scheduleEvents.filter(
                event => event.dayOfWeek === getDayNumberFromDate(selectedDate)
              )}
              timeSlots={timeSlots}
            />
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

// Sub-components for better organization

interface CalendarCardProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  weekDates: Date[];
}

function WeekSelector({ selectedDate, onSelectDate, weekDates }: CalendarCardProps) {
  const months = useMemo(() => {
    const uniqueMonths = new Set(weekDates.map(date => 
      date.toLocaleString('en-US', { month: 'long' })
    ));
    return Array.from(uniqueMonths).join(' - ');
  }, [weekDates]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          Week Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-600 text-center">
            {months} {weekDates[0].getFullYear()}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {weekDates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <Button
                  key={date.toISOString()}
                  variant={isSelected ? "default" : isToday ? "secondary" : "outline"}
                  className="p-2 h-auto flex flex-col gap-1 w-full"
                  onClick={() => onSelectDate(date)}
                >
                  <span className="text-xs font-medium">
                    {DAYS_OF_WEEK[index].slice(0, 3)}
                  </span>
                  <span className="text-lg font-semibold">
                    {date.getDate()}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UpcomingEventsProps {
  events: ScheduleEvent[];
}

function UpcomingEvents({ events }: UpcomingEventsProps) {
  // Sort events by day and time
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Classes</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-1">
          {sortedEvents.slice(0, 3).map(event => (
            <div 
              key={event.id}
              className="flex items-center p-2 rounded-md hover:bg-gray-50"
            >
              <div className={`w-1.5 h-10 rounded-full ${event.color ? `bg-${event.color}-500` : 'bg-gray-500'} mr-3 flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">{event.title}</h4>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{DAYS_OF_WEEK[event.dayOfWeek - 1].slice(0, 3)}, {event.startTime} - {event.endTime}</span>
                </div>
              </div>
              <Badge variant="outline" className="ml-2 text-xs">{event.location}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ScheduleTableProps {
  daysOfWeek: readonly string[];
  timeSlots: string[];
  getEvents: (day: number, time: string) => ScheduleEvent[];
  getEventDuration: (event: ScheduleEvent) => number;
  weekDates: Date[];
}

function ScheduleTable({ 
  daysOfWeek, 
  timeSlots,
  getEvents, 
  getEventDuration,
  weekDates
}: ScheduleTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div 
            className="grid grid-cols-[120px_repeat(5,1fr)] bg-gray-50 border-b"
            role="rowgroup"
          >
            <div className="p-3 font-medium text-gray-600" role="columnheader">Time</div>
            {daysOfWeek.map((day, index) => (
              <div 
                key={day} 
                className="p-3 text-center"
                role="columnheader"
              >
                <div className="font-medium text-gray-600">{day}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y" role="rowgroup">
            {timeSlots.map((time, timeIndex) => (
              <div 
                key={time} 
                className="grid grid-cols-[120px_repeat(5,1fr)] h-24 relative"
                role="row"
              >
                <time 
                  className="p-3 text-sm text-gray-500 flex items-center"
                  dateTime={`T${time.replace(':', '')}`}
                  role="cell"
                >
                  {time}
                </time>
                
                {daysOfWeek.map((_, dayIndex) => {
                  const dayNumber = dayIndex + 1;
                  const events = getEvents(dayNumber, time);
                  
                  return (
                    <TimeSlotCell 
                      key={`${dayNumber}-${time}`}
                      events={events}
                      getEventDuration={getEventDuration}
                      hideEvents={timeIndex > 0}
                      currentTimeSlot={time}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface TimeSlotCellProps {
  events: ScheduleEvent[];
  getEventDuration: (event: ScheduleEvent) => number;
  hideEvents?: boolean;
  currentTimeSlot: string;
}

function TimeSlotCell({ events, getEventDuration, hideEvents, currentTimeSlot }: TimeSlotCellProps) {
  if (!events.length || hideEvents) {
    return (
      <div 
        className="p-1 border-l relative hover:bg-gray-50 transition-colors"
        role="cell"
      />
    );
  }

  // Only show events that start in this time slot
  const eventsToShow = events.filter(event => {
    const [hour, minute] = event.startTime.split(':').map(Number);
    const [currentHour, currentMinute] = currentTimeSlot.split(':').map(Number);
    return hour === currentHour && minute === currentMinute;
  });

  return (
    <div 
      className="p-1 border-l relative hover:bg-gray-50 transition-colors"
      role="cell"
    >
      {eventsToShow.map((event) => (
        <ScheduleEventCard 
          key={event.id}
          event={event}
          duration={getEventDuration(event)}
        />
      ))}
    </div>
  );
}

interface ScheduleEventCardProps {
  event: ScheduleEvent;
  duration: number;
}

function ScheduleEventCard({ event, duration }: ScheduleEventCardProps) {
  return (
    <div
      className={`p-2 rounded-lg ${event.color ? `bg-${event.color}-50 border border-${event.color}-200 hover:bg-${event.color}-100` : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'} text-sm transition-colors cursor-pointer focus:ring-2 focus:outline-none absolute inset-x-1 z-10`}
      style={{ height: `${duration * 24 - 2}px` }} // 24px per slot, minus border
      role="button"
      tabIndex={0}
      aria-label={`${event.title} with ${event.teacher}`}
    >
      <h3 className={`font-medium ${event.color ? `text-${event.color}-900` : 'text-gray-900'} truncate`}>{event.title}</h3>
      
      <dl className="mt-1 space-y-1 text-xs text-gray-600">
        <div className="flex items-center">
          <UserIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <dd className="truncate">{event.teacher}</dd>
        </div>
        <div className="flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <time dateTime={`T${event.startTime.replace(':', '')}`}>
            {event.startTime} - {event.endTime}
          </time>
        </div>
        <div className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <dd className="truncate">{event.location}</dd>
        </div>
      </dl>
    </div>
  );
}

interface DailyScheduleProps {
  selectedDate: Date;
  events: ScheduleEvent[];
}

function DailySchedule({ selectedDate, events }: DailyScheduleProps) {
  // Sort events by start time
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })} Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length > 0 ? (
          <div className="space-y-4">
            {sortedEvents.map(event => (
              <div 
                key={event.id}
                className={`p-4 rounded-lg border-l-4 ${event.color ? `border-${event.color}-500 bg-${event.color}-50` : 'border-gray-500 bg-gray-50'} shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                  <Badge className={event.color ? `bg-${event.color}-100 text-${event.color}-800 border-${event.color}-300` : 'bg-gray-100 text-gray-800 border-gray-300'}>
                    {event.startTime} - {event.endTime}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">{event.teacher}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <CalendarDays className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No Classes Scheduled</h3>
            <p className="mt-1">There are no classes scheduled for this day.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}