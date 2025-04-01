import React, { useState } from 'react'
import { PlusCircle, Edit2, Trash2, Clock, MapPin, Users, Calendar, ChevronUp, ChevronDown } from 'lucide-react'
import { OfficeHour } from '@/types/calendar'
import { OfficeHourForm } from './office-hour-form'

interface OfficeHoursManagerProps {
  officeHours: OfficeHour[]
  onEdit: (officeHour: OfficeHour) => void
  onDelete: (officeHourId: string) => void
  onAdd: () => void
}

export const OfficeHoursManager = ({ officeHours, onEdit, onDelete, onAdd }: OfficeHoursManagerProps) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const [hoveredHourId, setHoveredHourId] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>('Monday') // Default expand Monday
  const [editingHourId, setEditingHourId] = useState<string | null>(null)
  
  // Group office hours by day
  const officeHoursByDay = daysOfWeek.map(day => {
    return {
      day,
      hours: officeHours.filter(hour => hour.dayOfWeek.toLowerCase() === day.toLowerCase())
    }
  })
  
  // Format time for display (12:00 PM format)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }
  
  // Get color for day header
  const getDayColor = (day: string, hasOfficeHours: boolean) => {
    if (!hasOfficeHours) return 'bg-gray-50 text-gray-500 border-gray-200'
    
    switch (day.toLowerCase()) {
      case 'monday':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'tuesday':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'wednesday':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'thursday':
        return 'bg-pink-50 text-pink-700 border-pink-200'
      case 'friday':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }
  
  // Toggle expanded day
  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  const handleEditClick = (hourId: string) => {
    setEditingHourId(hourId)
  }

  const handleCancelEdit = () => {
    setEditingHourId(null)
  }

  const handleSave = (hour: OfficeHour) => {
    onEdit(hour)
    setEditingHourId(null)
  }

  // Find the office hour being edited
  const editingHour = editingHourId 
    ? officeHours.find(hour => hour.id === editingHourId) 
    : undefined

  return (
    <div className="h-full overflow-y-auto pb-2">
      {/* Day sections with expandable content */}
      <div className="space-y-2">
        {officeHoursByDay.map(({ day, hours }) => (
          <div key={day} className="rounded-md border border-gray-200 overflow-hidden">
            {/* Day header */}
            <button 
              className={`w-full ${getDayColor(day, hours.length > 0)} 
                p-2 text-sm font-medium flex items-center justify-between
                hover:bg-opacity-80 transition-colors`}
              onClick={() => toggleDay(day)}
            >
              <div className="flex items-center">
                <span>{day}</span>
                {hours.length > 0 && (
                  <span className="ml-2 bg-white bg-opacity-60 text-xs px-1.5 py-0.5 rounded-full">
                    {hours.length}
                  </span>
                )}
              </div>
              {expandedDay === day ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {/* Expandable content */}
            {expandedDay === day && (
              <div className="p-2 space-y-2 bg-white">
                {hours.length === 0 ? (
                  <div className="text-center py-3 text-sm text-gray-500">
                    No office hours scheduled
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hours.map(hour => (
                      <div
                        key={hour.id}
                        className="bg-gray-50 border border-gray-200 rounded-md p-2"
                        onMouseEnter={() => setHoveredHourId(hour.id)}
                        onMouseLeave={() => setHoveredHourId(null)}
                      >
                        {editingHourId === hour.id ? (
                          <div className="text-sm text-center text-gray-500">
                            Editing... 
                            <button 
                              onClick={handleCancelEdit}
                              className="ml-2 text-xs text-red-600 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center text-sm font-medium text-gray-800">
                                <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                {formatTime(hour.startTime)} - {formatTime(hour.endTime)}
                              </div>
                              
                              {hour.location && (
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {hour.location}
                                </div>
                              )}
                              
                              {hour.maxStudents > 0 && (
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <Users className="h-3 w-3 mr-1" />
                                  Max: {hour.maxStudents} students
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-1 items-start">
                              <button
                                onClick={() => handleEditClick(hour.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                aria-label="Edit office hour"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => onDelete(hour.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                aria-label="Delete office hour"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add button for this day */}
                <button
                  onClick={onAdd}
                  className="w-full p-2 rounded-md bg-gray-50 hover:bg-gray-100 
                    border border-gray-200 border-dashed
                    flex items-center justify-center text-sm text-gray-600"
                >
                  <PlusCircle className="h-4 w-4 mr-1.5 text-gray-500" />
                  Add office hours
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Editing modal */}
      {editingHour && (
        <OfficeHourForm
          hour={editingHour}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  )
}
