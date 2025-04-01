import React from 'react'
import { CalendarEventItem } from '../calendar-event-item'
import type { CalendarDayData, ExtendedCalendarEvent } from '../types'

interface AllDayEventsProps {
  allDayEventsByDay: CalendarDayData[]
  onEventClick: (event: ExtendedCalendarEvent) => void
}

export const AllDayEvents: React.FC<AllDayEventsProps> = ({ 
  allDayEventsByDay, 
  onEventClick 
}) => {
  return (
    <div className="border-b border-gray-300 bg-white p-3 shadow-sm">
      <div className="text-xs font-medium text-gray-500 mb-2 pl-16 flex items-center">
        <div className="bg-indigo-50 text-indigo-600 rounded-md px-2 py-0.5 text-xs font-medium border border-indigo-100">
          All Day
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 pl-16">
        {allDayEventsByDay.map((day, dayIndex) => (
          <div key={`all-day-${dayIndex}`} className="min-h-10">
            {day.events && day.events.slice(0, 2).map((event) => (
              <div 
                key={`all-day-${event.id}`}
                className="mb-2"
                onClick={() => onEventClick(event)}
              >
                <CalendarEventItem
                  event={{...event, isAllDay: true}}
                  onClick={onEventClick}
                />
              </div>
            ))}
            {day.events && day.events.length > 2 && (
              <div 
                className="text-xs text-center text-gray-500 cursor-pointer hover:underline border border-gray-100 rounded-md py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => day.events && day.events.length > 0 && onEventClick(day.events[2])}
              >
                +{day.events.length - 2} more
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 