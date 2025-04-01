import React from 'react'

interface TimeAxisProps {
  hours: number[]
  getCellHeight: () => number
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ hours, getCellHeight }) => {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-16 bg-white z-10 border-r border-gray-200 flex flex-col pt-14 shadow-sm">
      {hours.map((hour) => (
        <div 
          key={`time-axis-${hour}`} 
          className="border-b border-gray-200 flex flex-col items-center justify-start pt-2"
          style={{ height: `${getCellHeight()}px` }}
        >
          <div className="flex items-center justify-center bg-white rounded-full shadow-sm h-5 w-12 -mt-2.5">
            <span className="text-xs font-medium text-gray-700">
              {hour === 0 || hour === 12 ? 12 : hour % 12}
              <span className="text-[9px] ml-0.5 text-gray-500">{hour >= 12 ? 'pm' : 'am'}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 