import React from 'react'
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react'
import type { CalendarView } from '../types'

interface CalendarHeaderProps {
  view: CalendarView
  currentDate: Date
  isTodayVisible: boolean
  navigateDate: (direction: 'prev' | 'next' | 'today') => void
  expandHoursRange?: () => void
  collapseHoursRange?: () => void
  compactMode?: boolean
  setCompactMode?: (compact: boolean) => void
  calendarData: Array<{
    name: string
    date: Date
    dateString: string
  }>
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  view,
  currentDate,
  isTodayVisible,
  navigateDate,
  expandHoursRange,
  collapseHoursRange,
  compactMode,
  setCompactMode,
  calendarData
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => navigateDate('today')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            isTodayVisible
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          Today
        </button>
        
        <button
          onClick={() => navigateDate('next')}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        <h2 className="text-base font-semibold text-gray-800 ml-2">
          {view === 'week' && calendarData.length >= 5 && 
            `${calendarData[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${calendarData[4].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          }
          {view === 'month' && 
            `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
          }
          {view === 'agenda' && 
            `${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
          }
        </h2>
      </div>
      
      {view === 'week' && expandHoursRange && collapseHoursRange && setCompactMode && (
        <div className="flex items-center space-x-2">
          <button
            onClick={expandHoursRange}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Show more hours"
            title="Show more hours"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          
          <button
            onClick={collapseHoursRange}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Show fewer hours"
            title="Show fewer hours"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              compactMode
                ? 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {compactMode ? 'Compact' : 'Detailed'}
          </button>
        </div>
      )}
    </div>
  )
} 