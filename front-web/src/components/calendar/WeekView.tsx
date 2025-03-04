import React from 'react';
import { CalendarEvent, getDaysInWeek, formatWeekdayHeader, formatDateCell, getHoursInDay, formatTimeHour } from '@/utils/calendarUtils';
import { isSameDay } from 'date-fns';
import { EventItem } from './EventItem';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCellClick: (date: Date, hour?: string) => void;
}

export const WeekView = ({ currentDate, events, onEventClick, onCellClick }: WeekViewProps) => {
  const days = getDaysInWeek(currentDate);
  const hours = getHoursInDay();
  const today = new Date();
  
  // Get weekday headers with dates
  const dayHeaders = days.map((day) => ({
    weekday: formatWeekdayHeader(day),
    date: formatDateCell(day),
    isToday: isSameDay(day, today)
  }));

  // Filter events for the current week
  const weekEvents = events.filter((event) => {
    return days.some((day) => isSameDay(event.start, day));
  });

  return (
    <div className="w-full overflow-auto">
      {/* Time grid header */}
      <div className="flex border-b">
        <div className="w-16 shrink-0"></div>
        {dayHeaders.map((day, index) => (
          <div 
            key={index} 
            className={`flex-1 p-2 text-center border-l ${day.isToday ? 'bg-primary-50 font-semibold' : ''}`}
          >
            <div className="text-sm">{day.weekday}</div>
            <div className={`text-xl ${day.isToday ? 'text-primary-700' : ''}`}>{day.date}</div>
          </div>
        ))}
      </div>
      
      {/* Time grid body */}
      <div className="flex flex-col">
        {hours.map((hour, hourIndex) => (
          <div key={hourIndex} className="flex border-b">
            {/* Hour column */}
            <div className="w-16 shrink-0 p-1 text-right text-xs text-gray-500 pr-2">
              {formatTimeHour(hour)}
            </div>
            
            {/* Day columns */}
            {days.map((day, dayIndex) => {
              const dayHour = new Date(day);
              dayHour.setHours(parseInt(hour.split(':')[0]), 0, 0, 0);
              
              // Filter events for this specific day and hour
              const hourEvents = weekEvents.filter((event) => {
                const eventHour = event.start.getHours();
                return isSameDay(event.start, day) && eventHour === parseInt(hour.split(':')[0]);
              });
              
              return (
                <div 
                  key={dayIndex} 
                  className={`flex-1 h-12 border-l relative ${isSameDay(day, today) ? 'bg-primary-50' : ''}`}
                  onClick={() => onCellClick(day, hour)}
                >
                  {hourEvents.map((event) => (
                    <EventItem 
                      key={event.id} 
                      event={event} 
                      onClick={() => onEventClick(event)} 
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
