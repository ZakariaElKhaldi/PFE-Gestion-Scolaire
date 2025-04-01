import React from 'react'
import type { CalendarDayData, ExtendedCalendarEvent } from '../types'

interface MonthViewGridProps {
  calendarData: CalendarDayData[]
  onEventClick: (event: ExtendedCalendarEvent) => void
}

export const MonthViewGrid: React.FC<MonthViewGridProps> = ({ 
  calendarData, 
  onEventClick 
}) => {
  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
          <div key={`weekday-${index}`} className="p-2 text-sm font-medium text-center text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarData.map((day, index) => (
          <div 
            key={`month-day-${index}`} 
            className={`border rounded-lg min-h-[100px] p-1.5 transition-colors ${
              day.date.toDateString() === new Date().toDateString() 
                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                : day.isCurrentMonth 
                  ? 'border-gray-200 bg-white hover:bg-gray-50' 
                  : 'border-gray-100 bg-gray-50 text-gray-400'
            }`}
          >
            <div className="text-right mb-1">
              <span className={`text-sm inline-flex items-center justify-center w-6 h-6 ${
                day.date.toDateString() === new Date().toDateString()
                  ? 'bg-blue-500 text-white rounded-full'
                  : ''
              }`}>
                {day.date.getDate()}
              </span>
            </div>
            
            <div className="space-y-1">
              {day.events && day.events.slice(0, 3).map((event: ExtendedCalendarEvent) => (
                <div 
                  key={`month-event-${event.id}`}
                  onClick={() => onEventClick(event)}
                  className={`
                    text-xs px-1.5 py-1 truncate cursor-pointer rounded-sm transition-colors
                    ${event.type === 'class' ? 'border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100' :
                      event.type === 'meeting' ? 'border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100' :
                      event.type === 'office_hours' ? 'border border-green-200 bg-green-50 text-green-800 hover:bg-green-100' :
                      event.type === 'exam' ? 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100' : 
                      'border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }
                  `}
                >
                  {event.title}
                </div>
              ))}
              
              {day.events && day.events.length > 3 && (
                <div 
                  className="text-xs text-center text-gray-500 cursor-pointer hover:underline hover:text-gray-700 transition-colors"
                  onClick={() => day.events && day.events.length > 0 && onEventClick(day.events[0])}
                >
                  +{day.events.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 