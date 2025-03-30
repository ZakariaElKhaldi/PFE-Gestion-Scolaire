import React from 'react'
import type { CalendarDayData } from '../types'

interface DayHeaderProps {
  calendarData: CalendarDayData[]
}

export const DayHeader: React.FC<DayHeaderProps> = ({ calendarData }) => {
  return (
    <div className="sticky top-0 z-20 pl-16 grid grid-cols-5 bg-white shadow-sm border-b border-gray-200">
      {calendarData.map((day, dayIndex) => (
        <div
          key={`day-header-${dayIndex}`}
          className={`p-3 text-center transition-colors ${
            day.date.toDateString() === new Date().toDateString() 
              ? 'bg-blue-50 border-b-2 border-blue-500' 
              : 'border-b border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-sm font-medium text-gray-900">{day.name.substring(0, 3)}</div>
          <div className={`text-xs ${
            day.date.toDateString() === new Date().toDateString() 
              ? 'text-blue-600 font-medium' 
              : 'text-gray-500'
          }`}>
            {day.dateString}
          </div>
        </div>
      ))}
    </div>
  )
} 