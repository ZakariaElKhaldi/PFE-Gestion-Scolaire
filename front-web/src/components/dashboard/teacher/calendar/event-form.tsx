import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Calendar as CalendarIcon, MapPin, Clock, FileText, Tag } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ExtendedCalendarEvent } from './types'
import { formatDate, formatTime } from '@/lib/calendar-utils'

// Event types available for selection
const EVENT_TYPES = [
  { id: 'class', label: 'Class', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'meeting', label: 'Meeting', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { id: 'office_hours', label: 'Office Hours', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'exam', label: 'Exam', color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 border-gray-300 text-gray-800' }
];

// Event status options
const EVENT_STATUSES = [
  { id: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 border-red-300 text-red-800' }
];

interface EventFormProps {
  event: ExtendedCalendarEvent | null
  selectedDate: Date | null
  selectedTime: string | null
  onSave: (event: ExtendedCalendarEvent) => void
  onCancel: () => void
  isOpen: boolean
}

export default function EventForm({
  event,
  selectedDate,
  selectedTime,
  onSave,
  onCancel,
  isOpen
}: EventFormProps) {
  // Initialize form state
  const [title, setTitle] = useState('')
  const [type, setType] = useState<string>('meeting')
  const [status, setStatus] = useState<string>('scheduled')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 60 * 60 * 1000)) // Default 1 hour later
  const [isAllDay, setIsAllDay] = useState(false)

  // Initialize form with existing event or defaults
  useEffect(() => {
    if (event) {
      // Edit existing event
      setTitle(event.title)
      setType(event.type || 'meeting')
      setStatus(event.status || 'scheduled')
      setLocation(event.location || '')
      setDescription(event.description || '')
      setStartDate(new Date(event.start))
      setEndDate(new Date(event.end))
      setIsAllDay(event.isAllDay || false)
    } else if (selectedDate) {
      // Create new event with selected date/time
      const newStart = new Date(selectedDate)
      
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number)
        newStart.setHours(hours, minutes, 0, 0)
      } else {
        // Default to current time rounded to nearest hour
        const hours = new Date().getHours()
        newStart.setHours(hours, 0, 0, 0)
      }
      
      const newEnd = new Date(newStart)
      newEnd.setHours(newEnd.getHours() + 1) // Default 1 hour duration
      
      setStartDate(newStart)
      setEndDate(newEnd)
      setIsAllDay(false)
    }
  }, [event, selectedDate, selectedTime])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newEvent: ExtendedCalendarEvent = {
      id: event?.id || uuidv4(),
      title,
      type: type as "class" | "office_hours" | "meeting" | "exam",
      status: status as "scheduled" | "in_progress" | "completed" | "cancelled",
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      location,
      description,
      isAllDay
    }
    
    onSave(newEvent)
    
    // Reset form
    setTitle('')
    setType('meeting')
    setStatus('scheduled')
    setLocation('')
    setDescription('')
    setStartDate(new Date())
    setEndDate(new Date(Date.now() + 60 * 60 * 1000))
    setIsAllDay(false)
  }

  // Handle "All Day" toggle
  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked)
    
    if (checked) {
      // Set times to start and end of day
      const newStart = new Date(startDate)
      newStart.setHours(0, 0, 0, 0)
      
      const newEnd = new Date(startDate)
      newEnd.setHours(23, 59, 59, 999)
      
      setStartDate(newStart)
      setEndDate(newEnd)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Date/Time Display */}
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md border border-gray-200">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                {formatDate(startDate)} {!isAllDay && `at ${formatTime(startDate)}`}
              </div>
              {!isAllDay && (
                <div className="text-sm text-gray-600">
                  Until {formatTime(endDate)}
                </div>
              )}
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>
          
          {/* Type */}
          <div className="space-y-2">
            <Label>Event Type <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EVENT_TYPES.map((eventType) => (
                <div
                  key={eventType.id}
                  className={`
                    border rounded-md px-3 py-2 text-sm cursor-pointer transition-all flex items-center
                    ${type === eventType.id ? eventType.color + ' ring-2 ring-offset-1' : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => setType(eventType.id)}
                >
                  <Tag className="h-3.5 w-3.5 mr-2" />
                  {eventType.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Status */}
          <div className="space-y-2">
            <Label>Status <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_STATUSES.map((eventStatus) => (
                <div
                  key={eventStatus.id}
                  className={`
                    border rounded-md px-3 py-2 text-sm cursor-pointer transition-all flex items-center
                    ${status === eventStatus.id ? eventStatus.color + ' ring-2 ring-offset-1' : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => setStatus(eventStatus.id)}
                >
                  <Clock className="h-3.5 w-3.5 mr-2" />
                  {eventStatus.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-1">
            <Label htmlFor="location" className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" /> Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room, building, or online link"
            />
          </div>
          
          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1" /> Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this event"
              rows={3}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {event ? 'Update' : 'Create'} Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 