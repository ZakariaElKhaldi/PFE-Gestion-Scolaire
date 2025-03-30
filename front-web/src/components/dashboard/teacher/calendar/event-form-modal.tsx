import React, { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle, 
  Check, 
  FileText, 
  Tag,
  Info,
  Calendar as CalendarIcon,
  Bookmark,
  Settings
} from 'lucide-react'
import { CalendarEvent } from '@/types/calendar'

// Extended calendar event with isAllDay property
interface ExtendedCalendarEvent extends CalendarEvent {
  isAllDay?: boolean;
}

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  event?: ExtendedCalendarEvent
  onSave: (event: ExtendedCalendarEvent) => void
  onDelete: (eventId: string) => void
  isSaving?: boolean
}

// Tab types to organize form content
type TabType = 'basics' | 'datetime' | 'details'

export const EventFormModal = ({ isOpen, onClose, event, onSave, onDelete, isSaving = false }: EventFormModalProps) => {
  const isEditMode = !!event?.id
  const [activeTab, setActiveTab] = useState<TabType>('basics')
  
  // Default start time is rounded to the nearest hour or half hour
  const getDefaultStartTime = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    if (minutes < 30) {
      now.setMinutes(30)
    } else {
      now.setMinutes(0)
      now.setHours(now.getHours() + 1)
    }
    now.setSeconds(0)
    now.setMilliseconds(0)
    return now.toISOString()
  }
  
  // Default end time is 1 hour after start
  const getDefaultEndTime = (start: string) => {
    const startDate = new Date(start)
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1)
    return endDate.toISOString()
  }
  
  const [formData, setFormData] = useState<ExtendedCalendarEvent>({
    id: event?.id || '',
    title: event?.title || '',
    type: event?.type || 'meeting',
    start: event?.start || getDefaultStartTime(),
    end: event?.end || getDefaultEndTime(event?.start || getDefaultStartTime()),
    location: event?.location || '',
    description: event?.description || '',
    attendees: event?.attendees || 0,
    status: event?.status || 'scheduled',
    isAllDay: event?.isAllDay || false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Reset form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id || '',
        title: event.title || '',
        type: event.type || 'meeting',
        start: event.start || getDefaultStartTime(),
        end: event.end || getDefaultEndTime(event.start || getDefaultStartTime()),
        location: event.location || '',
        description: event.description || '',
        attendees: event.attendees || 0,
        status: event.status || 'scheduled',
        isAllDay: event.isAllDay || false
      })
    } else {
      setFormData({
        id: '',
        title: '',
        type: 'meeting',
        start: getDefaultStartTime(),
        end: getDefaultEndTime(getDefaultStartTime()),
        location: '',
        description: '',
        attendees: 0,
        status: 'scheduled',
        isAllDay: false
      })
    }
    setErrors({})
    setActiveTab('basics')
  }, [event, isOpen])
  
  // Format dates for input fields
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }
  
  const formatTimeForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toTimeString().substring(0, 5)
  }
  
  // Handle combined date/time changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'start' | 'end') => {
    const { value } = e.target
    const currentDate = new Date(formData[field])
    const newDate = new Date(value)
    
    // Copy time from current date to new date
    newDate.setHours(
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds(),
      currentDate.getMilliseconds()
    )
    
    setFormData({
      ...formData,
      [field]: newDate.toISOString()
    })
    
    // Clear error when field is changed
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      })
    }
  }
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'start' | 'end') => {
    const { value } = e.target
    const currentDate = new Date(formData[field])
    const [hours, minutes] = value.split(':').map(Number)
    
    currentDate.setHours(hours, minutes, 0, 0)
    
    setFormData({
      ...formData,
      [field]: currentDate.toISOString()
    })
    
    // Clear error when field is changed
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      })
    }
    
    // If changing start time, also update end time to maintain duration
    if (field === 'start' && !errors.end) {
      const endDate = new Date(formData.end)
      const startDate = new Date(formData.start)
      const duration = endDate.getTime() - startDate.getTime()
      
      const newEndDate = new Date(currentDate.getTime() + duration)
      setFormData(prev => ({
        ...prev,
        end: newEndDate.toISOString()
      }))
    }
  }
  
  // Handle other input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: checkbox.checked
      })
      
      // If setting to all-day, adjust times
      if (name === 'isAllDay' && checkbox.checked) {
        const startDate = new Date(formData.start)
        startDate.setHours(9, 0, 0, 0)
        
        const endDate = new Date(formData.start)
        endDate.setHours(17, 0, 0, 0)
        
        setFormData(prev => ({
          ...prev,
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }))
      }
    } else if (name === 'attendees') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
      setActiveTab('basics')
    }
    
    const startDate = new Date(formData.start)
    const endDate = new Date(formData.end)
    
    if (endDate <= startDate) {
      newErrors.end = 'End time must be after start time'
      setActiveTab('datetime')
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Submit the form
    onSave(formData)
    setShowSuccess(true)
    
    // Reset form after submission
    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 1000)
  }
  
  // Handle delete
  const handleDelete = () => {
    if (formData.id && window.confirm('Are you sure you want to delete this event?')) {
      onDelete(formData.id)
      onClose()
    }
  }
  
  // Get event color based on type
  const getEventColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-blue-600'
      case 'meeting':
        return 'bg-purple-600'
      case 'office_hours':
        return 'bg-green-600'
      case 'exam':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getEventLightColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'meeting':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'office_hours':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'exam':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex min-h-full items-center justify-center p-0">
        <div className="fixed inset-0 bg-gray-900/75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-visible rounded-lg bg-white text-left shadow-xl w-full max-w-md mx-4">
          {/* Colored header based on event type */}
          <div className={`${getEventColor(formData.type)} px-3 py-2 text-white flex items-center justify-between rounded-t-lg`}>
            <h3 className="text-base font-medium flex items-center">
              {isEditMode ? 'Edit Event' : 'Add New Event'}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Tab navigation - more compact */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('basics')}
              className={`flex-1 py-2 px-2 text-center text-xs font-medium ${
                activeTab === 'basics'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'basics' ? 'page' : undefined}
            >
              <div className="flex items-center justify-center">
                <Bookmark className="h-3 w-3 mr-1" />
                Basics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('datetime')}
              className={`flex-1 py-2 px-2 text-center text-xs font-medium ${
                activeTab === 'datetime'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'datetime' ? 'page' : undefined}
            >
              <div className="flex items-center justify-center">
                <Clock className="h-3 w-3 mr-1" />
                Date & Time
              </div>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 px-2 text-center text-xs font-medium ${
                activeTab === 'details'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'details' ? 'page' : undefined}
            >
              <div className="flex items-center justify-center">
                <FileText className="h-3 w-3 mr-1" />
                Details
              </div>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100%-1rem)] max-h-[400px]">
            {/* Tab content - fixed height */}
            <div className="p-3 flex-1">
              {/* Basic info tab */}
              {activeTab === 'basics' && (
                <div className="space-y-2">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-xs font-medium text-gray-700">
                      Event Title
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter event title"
                        className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs border ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        } p-1.5`}
                      />
                      {errors.title && (
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.title && (
                      <p className="mt-0.5 text-xs text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Event Type */}
                    <div>
                      <label htmlFor="type" className="block text-xs font-medium text-gray-700">
                        Event Type
                      </label>
                      <div className="mt-1">
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1.5"
                        >
                          <option value="class">Class</option>
                          <option value="meeting">Meeting</option>
                          <option value="office_hours">Office Hours</option>
                          <option value="exam">Exam</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Status field moved to basics tab */}
                    <div>
                      <label htmlFor="status" className="block text-xs font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1.5"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* All Day toggle and Location in one row */}
                  <div className="grid grid-cols-4 gap-3 items-center">
                    <div className="flex items-center col-span-1">
                      <div className="flex h-5 items-center">
                        <input
                          id="isAllDay"
                          name="isAllDay"
                          type="checkbox"
                          checked={formData.isAllDay}
                          onChange={handleChange}
                          className="h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-2 text-xs">
                        <label htmlFor="isAllDay" className="font-medium text-gray-700">
                          All-day
                        </label>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="col-span-3">
                      <label htmlFor="location" className="block text-xs font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Room or meeting link"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1.5"
                      />
                    </div>
                  </div>
                  
                  {/* Preview at the bottom of basics tab */}
                  <div className={`rounded-md p-2 mt-1 ${getEventLightColor(formData.type)}`}>
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-medium truncate">{formData.title || 'Untitled Event'}</h5>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/50 font-medium">
                        {formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Date and Time tab */}
              {activeTab === 'datetime' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="start-date" className="block text-xs font-medium text-gray-700">
                        Start Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="start-date"
                          value={formatDateForInput(formData.start)}
                          onChange={(e) => handleDateChange(e, 'start')}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1.5"
                        />
                      </div>
                    </div>
                    
                    {!formData.isAllDay && (
                      <div>
                        <label htmlFor="start-time" className="block text-xs font-medium text-gray-700">
                          Start Time
                        </label>
                        <div className="mt-1">
                          <input
                            type="time"
                            id="start-time"
                            value={formatTimeForInput(formData.start)}
                            onChange={(e) => handleTimeChange(e, 'start')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1.5"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="end-date" className="block text-xs font-medium text-gray-700">
                        End Date
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="date"
                          id="end-date"
                          value={formatDateForInput(formData.end)}
                          onChange={(e) => handleDateChange(e, 'end')}
                          className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs border ${
                            errors.end ? 'border-red-500' : 'border-gray-300'
                          } p-1.5`}
                        />
                        {errors.end && (
                          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!formData.isAllDay && (
                      <div>
                        <label htmlFor="end-time" className="block text-xs font-medium text-gray-700">
                          End Time
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type="time"
                            id="end-time"
                            value={formatTimeForInput(formData.end)}
                            onChange={(e) => handleTimeChange(e, 'end')}
                            className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs border ${
                              errors.end ? 'border-red-500' : 'border-gray-300'
                            } p-1.5`}
                          />
                          {errors.end && (
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {errors.end && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {errors.end}
                    </p>
                  )}
                  
                  {/* Calendar preview (visual) */}
                  <div className="mt-2 border border-gray-200 rounded-md p-2 bg-gray-50">
                    <div className="text-[10px] text-gray-500 mb-1">Event duration:</div>
                    <div className="flex items-center">
                      <div className="text-xs font-medium">
                        {new Date(formData.start).toLocaleDateString()} 
                        {!formData.isAllDay && (
                          <span className="text-gray-500">
                            {" "}at {new Date(formData.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                      <span className="mx-2 text-gray-400">→</span>
                      <div className="text-xs font-medium">
                        {new Date(formData.end).toLocaleDateString() !== new Date(formData.start).toLocaleDateString() && (
                          <>{new Date(formData.end).toLocaleDateString()}</>
                        )}
                        {!formData.isAllDay && (
                          <span className="text-gray-500">
                            {new Date(formData.end).toLocaleDateString() !== new Date(formData.start).toLocaleDateString() ? " at " : ""}{new Date(formData.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Details tab */}
              {activeTab === 'details' && (
                <div className="space-y-2">
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-xs font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={2}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Add details about this event"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1.5"
                      />
                    </div>
                  </div>
                  
                  {/* Number of Attendees */}
                  <div>
                    <label htmlFor="attendees" className="block text-xs font-medium text-gray-700">
                      Number of Attendees
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="attendees"
                        name="attendees"
                        min="0"
                        value={formData.attendees}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1.5"
                      />
                    </div>
                  </div>
                  
                  {/* Event summary visualization */}
                  <div className="mt-2">
                    <div className={`rounded-md p-2 ${getEventLightColor(formData.type)}`}>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                        <Info className="h-2.5 w-2.5" />
                        <span>Event Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[10px] text-gray-500">Details</div>
                          <div className="text-xs truncate">
                            {formData.description ? formData.description.substring(0, 30) + (formData.description.length > 30 ? '...' : '') : 'No description'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500">Attendees</div>
                          <div className="text-xs flex items-center">
                            <Users className="h-3 w-3 mr-1 text-gray-400" />
                            <span>{typeof formData.attendees === 'number' ? formData.attendees : 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer with action buttons - more compact */}
            <div className="bg-gray-50 px-3 py-2 flex flex-wrap gap-2 justify-end border-t border-gray-200 rounded-b-lg">
              {isEditMode && (
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`inline-flex justify-center rounded-md border border-transparent px-3 py-1 text-xs font-medium text-white shadow-sm ${
                  showSuccess
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-0`}
                disabled={showSuccess}
              >
                {showSuccess ? (
                  <span className="flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Saved
                  </span>
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
