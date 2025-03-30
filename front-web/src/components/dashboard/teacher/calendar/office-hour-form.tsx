import React, { useState, useEffect } from 'react'
import { X, Calendar, MapPin, Users, Clock, AlertCircle, Check } from 'lucide-react'
import { OfficeHour } from '@/types/calendar'

interface OfficeHourFormProps {
  hour?: OfficeHour
  onSave: (hour: OfficeHour) => void
  onCancel: () => void
}

export const OfficeHourForm = ({ hour, onSave, onCancel }: OfficeHourFormProps) => {
  const [formData, setFormData] = useState<OfficeHour>({
    id: hour?.id || '',
    dayOfWeek: hour?.dayOfWeek || 'Monday',
    startTime: hour?.startTime || '09:00',
    endTime: hour?.endTime || '10:00',
    location: hour?.location || '',
    isRecurring: hour?.isRecurring ?? true,
    maxStudents: hour?.maxStudents || 5,
    currentBookings: hour?.currentBookings || 0
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Weekdays options
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  
  // Generate time options (7 AM to 7 PM in 15-minute increments)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 7; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0')
        const formattedMinute = minute.toString().padStart(2, '0')
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }
  
  const timeOptions = generateTimeOptions()
  
  // Format time for display
  const formatTimeForDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: checkbox.checked
      })
    } else if (name === 'maxStudents') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10)
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    
    if (formData.maxStudents <= 0) {
      newErrors.maxStudents = 'Maximum students must be greater than 0'
    }
    
    const startTime = formData.startTime.split(':').map(Number)
    const endTime = formData.endTime.split(':').map(Number)
    
    const startMinutes = startTime[0] * 60 + startTime[1]
    const endMinutes = endTime[0] * 60 + endTime[1]
    
    if (endMinutes <= startMinutes) {
      newErrors.endTime = 'End time must be after start time'
    }
    
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Show success animation
    setShowSuccess(true)
    
    // Wait for animation then save
    setTimeout(() => {
      onSave({
        ...formData,
        id: formData.id || Math.random().toString(36).substr(2, 9)
      })
    }, 750)
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            {hour?.id ? 'Edit Office Hours' : 'Add New Office Hours'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Day of Week */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
              Day of Week
            </label>
            <select
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          
          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                Start Time
              </label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                {timeOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                End Time
              </label>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {timeOptions.map((time) => (
                  <option key={`end-${time}`} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Room number or online meeting link"
              className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.location}
              </p>
            )}
          </div>
          
          {/* Maximum Students */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-gray-500" />
              Maximum Students
            </label>
            <input
              type="number"
              name="maxStudents"
              min="1"
              max="50"
              value={formData.maxStudents}
              onChange={handleChange}
              className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                errors.maxStudents ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.maxStudents && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.maxStudents}
              </p>
            )}
          </div>
          
          {/* Recurring Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
              Recurring weekly
            </label>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`relative px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 min-w-[90px] ${
                showSuccess ? 'bg-green-500' : ''
              }`}
              disabled={showSuccess}
            >
              {showSuccess ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
              ) : hour?.id ? 'Save Changes' : 'Add Hours'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
