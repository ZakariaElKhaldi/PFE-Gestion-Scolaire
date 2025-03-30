import React, { useRef, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { Clock, MapPin, Users, AlertCircle } from 'lucide-react'
import { CalendarEvent } from '@/types/calendar'

// Extended calendar event with isAllDay property
interface ExtendedCalendarEvent extends CalendarEvent {
  isAllDay?: boolean;
}

interface CalendarEventItemProps {
  event: ExtendedCalendarEvent
  onClick: (event: ExtendedCalendarEvent) => void
  compact?: boolean
}

export const CalendarEventItem = ({ event, onClick, compact = false }: CalendarEventItemProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  
  // Setup drag and drop
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'calendar-event',
    item: { type: 'calendar-event', event },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [event])
  
  // Connect the drag reference to our element ref
  useEffect(() => {
    if (elementRef.current) {
      dragRef(elementRef.current)
    }
  }, [dragRef])
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  
  // Format time range for display
  const formatTimeRange = () => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    
    return `${formatTime(event.start)} - ${formatTime(event.end)}`
  }
  
  // Calculate event duration in minutes
  const getDuration = () => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }
  
  // Get event background color based on type
  const getEventColor = () => {
    switch (event.type) {
      case 'class':
        return 'bg-blue-50 text-blue-800'
      case 'meeting':
        return 'bg-purple-50 text-purple-800'
      case 'office_hours':
        return 'bg-green-50 text-green-800'
      case 'exam':
        return 'bg-red-50 text-red-800'
      default:
        return 'bg-gray-50 text-gray-800'
    }
  }
  
  // Get event border classes
  const getEventBorderStyles = () => {
    switch (event.type) {
      case 'class':
        return 'border-blue-200 border-l-2 border-l-blue-500'
      case 'meeting':
        return 'border-purple-200 border-l-2 border-l-purple-500'
      case 'office_hours':
        return 'border-green-200 border-l-2 border-l-green-500'
      case 'exam':
        return 'border-red-200 border-l-2 border-l-red-500'
      default:
        return 'border-gray-200 border-l-2 border-l-gray-500'
    }
  }
  
  // Get status color
  const getStatusColor = () => {
    switch (event.status) {
      case 'in_progress':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-green-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }
  
  // Duration shorter than 30 minutes gets a condensed view
  const isShortEvent = compact || getDuration() < 30
  const isAllDay = event.isAllDay || false
  
  // Event display optimized for the space available
  return (
    <div
      ref={elementRef}
      className={`
        h-full w-full overflow-hidden flex flex-col border rounded
        ${getEventColor()}
        ${getEventBorderStyles()}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-all duration-150 shadow-sm
      `}
    >
      {/* Status indicator and title bar */}
      <div className="flex items-center pr-1.5 min-h-[22px]">
        <div className="flex-1 truncate">
          <div className="text-xs font-medium truncate px-1.5 py-1">
            {event.title}
          </div>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getStatusColor()}`} />
      </div>
      
      {/* Event details - shown only if there's enough space and not in compact mode */}
      {!isShortEvent && !isAllDay && (
        <div className="text-[10px] text-gray-600 px-1.5 mt-0.5 flex-1 overflow-hidden">
          {/* Time indicator */}
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-0.5 flex-shrink-0 text-gray-500" />
            <span className="truncate font-medium">{formatTimeRange()}</span>
          </div>
          
          {/* Location - if available and there's room */}
          {event.location && getDuration() >= 45 && (
            <div className="flex items-center mt-0.5 truncate">
              <MapPin className="h-3 w-3 mr-0.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {/* Attendees count - if available and there's room */}
          {event.attendees && event.attendees > 0 && getDuration() >= 60 && (
            <div className="flex items-center mt-0.5">
              <Users className="h-3 w-3 mr-0.5 flex-shrink-0 text-gray-500" />
              <span>{event.attendees} attendee{event.attendees !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
      
      {/* For all-day events, just show time if not isAllDay */}
      {!isAllDay && isShortEvent && (
        <div className="text-[9px] text-gray-600 px-1.5 pb-0.5">
          <div className="flex items-center justify-start">
            <Clock className="h-2.5 w-2.5 mr-0.5 flex-shrink-0 text-gray-500" />
            <span className="truncate">{formatTime(event.start)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
