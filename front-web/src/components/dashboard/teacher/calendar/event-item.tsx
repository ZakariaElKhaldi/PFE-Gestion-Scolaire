import React, { useRef, useState } from 'react'
import { Clock, MapPin, User } from 'lucide-react'
import { formatTime } from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'
import { ExtendedCalendarEvent } from './types'

interface EventItemProps {
  event: ExtendedCalendarEvent
  onEdit: (event: ExtendedCalendarEvent) => void
  onDelete: (id: string) => void
  onDragStart: (event: React.DragEvent, calendarEvent: ExtendedCalendarEvent) => void
}

export default function EventItem({ event, onEdit, onDelete, onDragStart }: EventItemProps) {
  const [popoverPosition, setPopoverPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const eventRef = useRef<HTMLDivElement>(null)
  
  // Check position on mouse enter to decide where to show the popover
  const handleMouseEnter = () => {
    if (!eventRef.current) return
    
    const rect = eventRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // Determine best position for popover
    if (rect.top < 150) {
      // Near top of screen, show below
      setPopoverPosition('bottom')
    } else if (viewportHeight - rect.bottom < 150) {
      // Near bottom of screen, show above
      setPopoverPosition('top')
    } else if (rect.left < 150) {
      // Near left edge, show on right
      setPopoverPosition('right')
    } else if (viewportWidth - rect.right < 150) {
      // Near right edge, show on left
      setPopoverPosition('left')
    } else {
      // Default position
      setPopoverPosition('top')
    }
  }

  // Determine event colors based on type
  const getEventClass = () => {
    switch (event.type) {
      case 'class':
        return 'bg-blue-100 border-blue-300 text-blue-800 hover:border-blue-400';
      case 'meeting':
        return 'bg-purple-100 border-purple-300 text-purple-800 hover:border-purple-400';
      case 'office_hours':
        return 'bg-green-100 border-green-300 text-green-800 hover:border-green-400';
      case 'exam':
        return 'bg-red-100 border-red-300 text-red-800 hover:border-red-400';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 hover:border-gray-400';
    }
  };

  // Determine status indicator color
  const getStatusClass = () => {
    switch (event.status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(event);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event.id);
  };

  // Get popover position classes
  const getPopoverPositionClass = () => {
    switch (popoverPosition) {
      case 'top':
        return 'bottom-full mb-1'
      case 'bottom':
        return 'top-full mt-1'
      case 'left':
        return 'right-full mr-1'
      case 'right':
        return 'left-full ml-1'
      default:
        return 'top-full mt-1'
    }
  }

  return (
    <div className="relative group" ref={eventRef} onMouseEnter={handleMouseEnter}>
      {/* Main event card (always visible) */}
      <div
        className={cn(
          'rounded-md border p-1 text-[9px] cursor-move',
          'transform transition-all duration-150 ease-in-out',
          'hover:shadow-sm hover:border-2',
          getEventClass()
        )}
        onClick={handleClick}
        draggable
        onDragStart={(e) => onDragStart(e, event)}
      >
        <div className="flex items-center gap-0.5">
          <div className={cn('h-1.5 w-1.5 rounded-full', getStatusClass())} />
          <div className="font-medium truncate flex-1 text-[9px]">{event.title}</div>
        </div>
      </div>
      
      {/* Expanded content (visible on hover) */}
      <div className={cn(
        "absolute z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-150",
        getPopoverPositionClass()
      )}>
        <div className={cn(
          'rounded-md border p-2 shadow-md',
          'text-[9px] w-48 space-y-1.5',
          getEventClass()
        )}>
          <div className="font-medium text-[10px]">{event.title}</div>
          
          {event.location && (
            <div className="flex items-center gap-1 text-[8px] opacity-80">
              <MapPin className="h-2.5 w-2.5" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {!event.isAllDay && (
            <div className="flex items-center gap-1 text-[8px] opacity-80">
              <Clock className="h-2.5 w-2.5" />
              <span>
                {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
              </span>
            </div>
          )}
          
          {event.description && (
            <div className="text-[8px] opacity-80 mt-1">
              {event.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 