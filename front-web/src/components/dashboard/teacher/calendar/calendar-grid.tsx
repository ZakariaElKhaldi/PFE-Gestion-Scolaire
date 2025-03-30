import React, { useState, useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { CalendarEvent, DragItem } from '@/types/calendar'
import { CalendarView, ExtendedCalendarEvent } from './types'
import EventForm from './event-form'
import EventItem from './event-item'
import { generateTimeSlots, isSameDay, getEventsForDayAndTime } from '@/lib/calendar-utils'

interface CalendarGridProps {
  events: ExtendedCalendarEvent[]
  onEventClick: (event: ExtendedCalendarEvent) => void
  onEventDrop: (item: DragItem, date: Date) => void
  onEventCreate?: (event: ExtendedCalendarEvent) => void
  onEventDelete?: (id: string) => void
  view?: CalendarView
  currentDate?: Date
  showHeaderControls?: boolean
}

export const CalendarGrid = ({
  events,
  onEventClick,
  onEventDrop,
  onEventCreate,
  onEventDelete,
  view: externalView = 'week',
  currentDate: externalCurrentDate,
  showHeaderControls = true
}: CalendarGridProps) => {
  // Use external date/view if provided, otherwise use internal state
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date())
  
  const currentDate = externalCurrentDate || internalCurrentDate
  const view = externalView
  
  // State for event creation
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ExtendedCalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [draggedEvent, setDraggedEvent] = useState<ExtendedCalendarEvent | null>(null)
  
  // Ref for the calendar grid
  const calendarRef = useRef<HTMLDivElement>(null)
  
  // Generate time slots for the calendar - start at 08:00 and go to 15:30
  const timeSlots = generateTimeSlots(8, 15, 30)
  
  // Calculate week dates for week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  // Navigation functions
  const handlePrevPeriod = () => {
    if (!externalCurrentDate) {
      if (view === 'week') {
        setInternalCurrentDate(subWeeks(internalCurrentDate, 1))
      } else if (view === 'month') {
        const newDate = new Date(internalCurrentDate)
        newDate.setMonth(newDate.getMonth() - 1)
        setInternalCurrentDate(newDate)
      } else { // day view
        const newDate = new Date(internalCurrentDate)
        newDate.setDate(newDate.getDate() - 1)
        setInternalCurrentDate(newDate)
      }
    }
  }
  
  const handleNextPeriod = () => {
    if (!externalCurrentDate) {
      if (view === 'week') {
        setInternalCurrentDate(addWeeks(internalCurrentDate, 1))
      } else if (view === 'month') {
        const newDate = new Date(internalCurrentDate)
        newDate.setMonth(newDate.getMonth() + 1)
        setInternalCurrentDate(newDate)
      } else { // day view
        const newDate = new Date(internalCurrentDate)
        newDate.setDate(newDate.getDate() + 1)
        setInternalCurrentDate(newDate)
      }
    }
  }
  
  const handleToday = () => {
    if (!externalCurrentDate) {
      setInternalCurrentDate(new Date())
    }
  }
  
  // Event handlers
  const handleCellClick = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setSelectedEvent(null)
    setShowEventForm(true)
  }
  
  const handleEditEvent = (event: ExtendedCalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setSelectedTime(null)
    setShowEventForm(true)
  }
  
  const handleAddEvent = (event: ExtendedCalendarEvent) => {
    if (onEventCreate) {
      onEventCreate(event)
    }
    setShowEventForm(false)
    setSelectedEvent(null)
    setSelectedDate(null)
    setSelectedTime(null)
  }
  
  const handleDeleteEvent = (id: string) => {
    if (onEventDelete) {
      onEventDelete(id)
    }
  }
  
  // Drag and drop handlers
  const handleDragStart = (event: React.DragEvent, calendarEvent: ExtendedCalendarEvent) => {
    setDraggedEvent(calendarEvent)
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', calendarEvent.id)
      event.dataTransfer.effectAllowed = 'move'
    }
  }
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }
  
  const handleDrop = (event: React.DragEvent, date: Date, time: string) => {
    event.preventDefault()
    
    if (!draggedEvent || !onEventDrop) return
    
    const [hours, minutes] = time.split(':').map(Number)
    
    const dropDate = new Date(date)
    dropDate.setHours(hours, minutes, 0, 0)
    
    // Create a DragItem compatible with our existing onEventDrop
    const dragItem: DragItem = {
      type: 'calendar-event',
      event: draggedEvent as CalendarEvent // Cast to CalendarEvent
    }
    
    onEventDrop(dragItem, dropDate)
    setDraggedEvent(null)
  }
  
  // Render day view
  const renderDayView = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 border-b">
        <div className="p-2 border-r bg-muted"></div>
        <div className="p-2 text-center font-medium">
          <div>{format(currentDate, 'EEEE')}</div>
          <div className="text-sm">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
      </div>
      
      <div ref={calendarRef} className="grid grid-cols-2 h-[600px] overflow-y-auto">
        {timeSlots.map((time) => {
          const dayEvents = getEventsForDayAndTime(events, currentDate, time)
          return (
            <React.Fragment key={time}>
              <div className="p-1.5 text-[10px] border-r border-b bg-muted text-center">{time}</div>
              <div
                className="border-b relative p-1 min-h-[40px]"
                onClick={() => handleCellClick(currentDate, time)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, currentDate, time)}
              >
                <div className="space-y-0.5 relative">
                  {dayEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
  
  // Render week view
  const renderWeekView = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 border-r bg-muted"></div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              "p-2 text-center font-medium border-r last:border-r-0",
              isSameDay(day, new Date()) && "bg-primary/10"
            )}
          >
            <div>{format(day, 'EEE')}</div>
            <div className="text-sm">{format(day, 'MMM d')}</div>
          </div>
        ))}
        </div>
      
      <div ref={calendarRef} className="grid grid-cols-8 h-[600px] overflow-y-auto">
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="p-1.5 text-[10px] border-r border-b bg-muted text-center">{time}</div>
            {days.map((day) => {
              const dayEvents = getEventsForDayAndTime(events, day, time)
              return (
                <div
                  key={`${day}-${time}`}
                  className={cn(
                    "border-r border-b last:border-r-0 relative p-1 min-h-[40px]",
                    isSameDay(day, new Date()) && "bg-primary/5"
                  )}
                  onClick={() => handleCellClick(day, time)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day, time)}
                >
                  <div className="space-y-0.5 relative">
                    {dayEvents.map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}
                        </div>
                      </div>
  )
  
  // Render month view
  const renderMonthView = () => {
    // Calculate the first and last day of the month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    // Get the day of week of the first day (0 = Sunday)
    // Convert to Monday-based (0 = Monday, 6 = Sunday)
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    // Calculate the days to show in the grid (padding with days from prev/next month)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDayOfWeek)
    
    const endDate = new Date(lastDay)
    const remainingDays = (6 - (lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1))
    endDate.setDate(endDate.getDate() + remainingDays)
    
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Group days into weeks
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }
    
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="p-2 text-center font-medium border-r last:border-r-0 bg-muted">
              {day}
                    </div>
                  ))}
                </div>
                
        <div className="grid grid-rows-6">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.start)
                  return isSameDay(eventDate, day)
                })
                    
                    return (
                      <div 
                    key={day.toString()}
                    className={cn(
                      "border p-1 h-20 overflow-y-auto relative",
                      !isCurrentMonth && "bg-gray-50 text-gray-400",
                      isSameDay(day, new Date()) && "bg-primary/5"
                    )}
                    onClick={() => handleCellClick(day, '09:00')}
                  >
                    <div className="text-right font-medium text-[10px]">
                      {day.getDate()}
                    </div>
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-[8px] py-0.5 px-1 rounded truncate cursor-pointer group relative",
                            "hover:shadow-sm transition-all duration-150",
                            event.type === 'class' ? 'bg-blue-100 text-blue-800' :
                            event.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                            event.type === 'office_hours' ? 'bg-green-100 text-green-800' :
                            event.type === 'exam' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditEvent(event)
                          }}
                        >
                          {event.title}
                          </div>
                        ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[8px] text-center text-gray-500 cursor-pointer hover:underline">
                          +{dayEvents.length - 3} more
                          </div>
                        )}
                    </div>
                </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // Determine which view to render
  const renderCalendarView = () => {
    switch (view) {
      case 'day':
        return renderDayView()
      case 'month':
        return renderMonthView()
      case 'week':
      default:
        return renderWeekView()
    }
  }
  
  // Update the header controls section to properly emit view changes
  // Header controls for the calendar
  const renderHeaderControls = () => (
    <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-md shadow-sm">
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-5 w-5 text-gray-500" />
        <span className="text-xl font-semibold">Calendar</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handlePrevPeriod} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleToday} className="h-8 px-3 text-xs">
          Today
        </Button>
        
        <div className="text-sm font-medium mx-2">
          {view === 'week' && `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
          {view === 'month' && format(currentDate, 'MMMM yyyy')}
          {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
        </div>
        
        <Button variant="outline" size="sm" onClick={handleNextPeriod} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
  
  return (
    <div className="flex flex-col space-y-4">
      {renderHeaderControls()}
      
      {/* Main calendar view */}
      {renderCalendarView()}
      
      {/* Event form */}
      {showEventForm && (
        <EventForm
          event={selectedEvent}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSave={handleAddEvent}
          onCancel={() => setShowEventForm(false)}
          isOpen={showEventForm}
        />
      )}
    </div>
  )
}