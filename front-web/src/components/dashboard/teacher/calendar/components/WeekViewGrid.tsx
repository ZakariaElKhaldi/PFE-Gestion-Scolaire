import React, { useState, useCallback } from 'react'
import { TimeAxis } from './TimeAxis'
import { DayHeader } from './DayHeader'
import { CalendarEventItem } from '../calendar-event-item'
import type { CalendarDayData, ExtendedCalendarEvent } from '../types'

interface WeekViewGridProps {
  gridRef: React.RefObject<HTMLDivElement>
  visibleHoursRange: { start: number; end: number }
  hours: number[]
  calendarData: CalendarDayData[]
  eventsByDay: CalendarDayData[]
  getCellHeight: () => number
  compactMode: boolean
  currentHour: number
  currentMinutes: number
  currentDayIndex: number
  isCurrentTimeVisible: boolean
  isHappeningNow: (event: ExtendedCalendarEvent) => boolean
  onEventClick: (event: ExtendedCalendarEvent) => void
  onTimeSelect?: (start: Date, end: Date) => void
}

export const WeekViewGrid: React.FC<WeekViewGridProps> = ({
  gridRef,
  visibleHoursRange,
  hours,
  calendarData,
  eventsByDay,
  getCellHeight,
  compactMode,
  currentHour,
  currentMinutes,
  currentDayIndex,
  isCurrentTimeVisible,
  isHappeningNow,
  onEventClick,
  onTimeSelect
}) => {
  // State for time selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ day: number; time: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ day: number; time: number } | null>(null);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback((dayIndex: number, offsetY: number) => {
    const cellHeight = getCellHeight();
    const hourOffset = Math.floor(offsetY / cellHeight);
    const minuteOffset = Math.round((offsetY % cellHeight) / cellHeight * 60);
    const timeOffset = hourOffset + (minuteOffset / 60);
    
    setIsSelecting(true);
    setSelectionStart({ day: dayIndex, time: timeOffset });
    setSelectionEnd({ day: dayIndex, time: timeOffset });
  }, [getCellHeight]);

  // Handle mouse move during selection
  const handleMouseMove = useCallback((dayIndex: number, offsetY: number) => {
    if (!isSelecting || !selectionStart) return;
    
    const cellHeight = getCellHeight();
    const hourOffset = Math.floor(offsetY / cellHeight);
    const minuteOffset = Math.round((offsetY % cellHeight) / cellHeight * 60);
    const timeOffset = hourOffset + (minuteOffset / 60);
    
    setSelectionEnd({ day: dayIndex, time: timeOffset });
  }, [isSelecting, selectionStart, getCellHeight]);

  // Handle mouse up to end selection
  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd && onTimeSelect) {
      // Ensure indices are valid for our calendar data
      const startDayIndex = Math.min(
        Math.max(0, selectionStart.day),
        calendarData.length - 1
      );
      
      const endDayIndex = Math.min(
        Math.max(0, selectionEnd.day),
        calendarData.length - 1
      );
      
      const startDay = calendarData[startDayIndex].date;
      const endDay = calendarData[endDayIndex].date;
      
      const startHour = Math.floor(selectionStart.time) + visibleHoursRange.start;
      const startMinute = Math.round((selectionStart.time % 1) * 60);
      
      const endHour = Math.floor(selectionEnd.time) + visibleHoursRange.start;
      const endMinute = Math.round((selectionEnd.time % 1) * 60);

      const start = new Date(startDay);
      start.setHours(startHour, startMinute, 0, 0);
      
      const end = new Date(endDay);
      end.setHours(endHour, endMinute, 0, 0);
      
      // Ensure start is before end
      if (start <= end) {
        onTimeSelect(start, end);
      } else {
        onTimeSelect(end, start);
      }
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, calendarData, visibleHoursRange, onTimeSelect]);

  // Calculate selection display positions and dimensions
  const getSelectionStyle = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) return null;
    
    const dayStart = Math.min(selectionStart.day, selectionEnd.day);
    const dayEnd = Math.max(selectionStart.day, selectionEnd.day);
    const timeStart = Math.min(selectionStart.time, selectionEnd.time);
    const timeEnd = Math.max(selectionStart.time, selectionEnd.time);
    
    const cellHeight = getCellHeight();
    
    return {
      top: `${timeStart * cellHeight}px`,
      height: `${(timeEnd - timeStart) * cellHeight}px`,
      left: `${dayStart * 20}%`,
      width: `${(dayEnd - dayStart + 1) * 20}%`
    };
  };

  // Generate selection display element
  const renderSelection = () => {
    const style = getSelectionStyle();
    if (!style) return null;
    
    return (
      <div 
        className="absolute bg-blue-200/50 border border-blue-400 rounded-sm z-5 pointer-events-none"
        style={style}
      />
    );
  };

  return (
    <div 
      ref={gridRef}
      className="calendar-grid flex-1 relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Time axis on the left */}
      <TimeAxis hours={hours} getCellHeight={getCellHeight} />
      
      {/* Grid header with day names */}
      <DayHeader calendarData={calendarData} />
      
      {/* Grid Layout */}
      <div className="grid grid-cols-5 min-h-full pl-16 bg-white">
        {/* Day columns */}
        {calendarData.map((day, dayIndex) => (
          <div 
            key={`day-${dayIndex}`}
            className={`day-column border-r border-gray-200 flex flex-col relative ${
              day.date.toDateString() === new Date().toDateString() 
                ? 'bg-blue-50/20' 
                : dayIndex % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
            }`}
          >
            {/* Time grid */}
            <div 
              className="flex-1 relative"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                handleMouseDown(dayIndex, offsetY);
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                handleMouseMove(dayIndex, offsetY);
              }}
            >
              {/* Hour guide lines */}
              <div className="absolute inset-0">
                {hours.map((hour, hourIndex) => (
                  <div 
                    key={`hour-${hour}`}
                    className={`absolute left-0 right-0 border-b ${
                      hour === currentHour && day.date.toDateString() === new Date().toDateString() 
                        ? 'bg-blue-50/40 border-blue-100' 
                        : hour % 2 === 0 ? 'bg-gray-50/40 border-gray-200' : 'border-gray-100'
                    }`}
                    style={{ 
                      top: `${hourIndex * getCellHeight()}px`, 
                      height: `${getCellHeight()}px`
                    }}
                  >
                    {/* Half-hour marker */}
                    <div 
                      className="absolute left-0 right-0 border-b border-gray-100 border-dashed" 
                      style={{ top: `${getCellHeight() / 2}px` }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Events for this day */}
              <div className="relative h-full z-10 px-1.5 py-0.5">
                {/* Time selection overlay */}
                {isSelecting && renderSelection()}

                {/* Events by hour */}
                {eventsByDay[dayIndex].events &&
                  eventsByDay[dayIndex].events
                    .filter((event: ExtendedCalendarEvent) => 
                      !event.isAllDay && 
                      !((new Date(event.end).getTime() - new Date(event.start).getTime()) >= 6 * 60 * 60 * 1000)
                    )
                    .map((event: ExtendedCalendarEvent, eventIndex: number, eventsArray: ExtendedCalendarEvent[]) => {
                      const startDate = new Date(event.start);
                      const endDate = new Date(event.end);
                      
                      // Skip if outside visible range
                      if (startDate.getHours() > visibleHoursRange.end || endDate.getHours() < visibleHoursRange.start) {
                        return null;
                      }
                      
                      // Calculate position
                      const startHour = Math.max(startDate.getHours(), visibleHoursRange.start);
                      const startMinutes = startDate.getHours() < visibleHoursRange.start ? 0 : startDate.getMinutes();
                      const endHour = Math.min(endDate.getHours(), visibleHoursRange.end);
                      const endMinutes = endDate.getHours() > visibleHoursRange.end ? 59 : endDate.getMinutes();
                      
                      const startPosition = (startHour - visibleHoursRange.start) * getCellHeight() + 
                        (startMinutes / 60) * getCellHeight();
                        
                      const endPosition = (endHour - visibleHoursRange.start) * getCellHeight() + 
                        (endMinutes / 60) * getCellHeight();
                        
                      const height = Math.max(endPosition - startPosition, 24); // Minimum height
                      
                      // Handle overlapping events
                      const isOverlapping = (event1: ExtendedCalendarEvent, event2: ExtendedCalendarEvent) => {
                        const start1 = new Date(event1.start).getTime();
                        const end1 = new Date(event1.end).getTime();
                        const start2 = new Date(event2.start).getTime();
                        const end2 = new Date(event2.end).getTime();
                        
                        return (start1 < end2 && start2 < end1);
                      };
                      
                      // Get all overlapping events
                      const overlappingEvents = eventsArray.filter((e: ExtendedCalendarEvent) => 
                        e.id !== event.id && isOverlapping(e, event)
                      );
                      
                      // Calculate width and offset based on overlaps
                      const totalOverlaps = overlappingEvents.length + 1; // Including this event
                      const width = totalOverlaps > 1 ? `${92 / totalOverlaps}%` : '92%';
                      
                      // Determine x position (left offset)
                      // Find position in the sorted group of overlapping events
                      const overlapGroup = [event, ...overlappingEvents].sort(
                        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
                      );
                      const position = overlapGroup.findIndex((e: ExtendedCalendarEvent) => e.id === event.id);
                      const left = position * (92 / totalOverlaps) + 4; // Add 4% margin
                      
                      return (
                        <div
                          key={`event-${event.id}`}
                          className={`
                            absolute rounded-md shadow-xs border
                            ${isHappeningNow(event) ? 'ring-2 ring-blue-500 z-20' : 'z-10'}
                            hover:shadow-md hover:z-30 transition-all duration-150
                            ${event.type === 'class' ? 'border-blue-200 bg-blue-50' :
                              event.type === 'meeting' ? 'border-purple-200 bg-purple-50' :
                              event.type === 'office_hours' ? 'border-green-200 bg-green-50' :
                              event.type === 'exam' ? 'border-red-200 bg-red-50' : 
                              'border-gray-200 bg-gray-50'
                            }
                          `}
                          style={{
                            top: `${startPosition + 1}px`,
                            height: `${height}px`,
                            left: `${left}%`,
                            width: width,
                          }}
                          onClick={() => onEventClick(event)}
                        >
                          <CalendarEventItem
                            event={event}
                            onClick={onEventClick}
                            compact={compactMode}
                          />
                        </div>
                      );
                    })}
                
                {/* Current time indicator */}
                {isCurrentTimeVisible && currentDayIndex === dayIndex && (
                  <div className="absolute z-30 flex items-center" style={{ 
                    top: `${(currentHour - visibleHoursRange.start) * getCellHeight() + (currentMinutes / 60) * getCellHeight()}px`,
                    left: 0,
                    right: 0
                  }}>
                    <div className="relative">
                      <div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-red-500 shadow-md animate-pulse"></div>
                    </div>
                    <div className="h-0.5 bg-red-500 w-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 