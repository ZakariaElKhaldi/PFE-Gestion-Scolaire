import React, { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import type { ExtendedCalendarEvent } from '../types'

// Event types available for selection
const EVENT_TYPES = [
  { id: 'class', label: 'Class', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: 'meeting', label: 'Meeting', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'office_hours', label: 'Office Hours', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: 'exam', label: 'Exam', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 border-gray-300 text-gray-700' }
];

// Event status options
const EVENT_STATUSES = [
  { id: 'confirmed', label: 'Confirmed', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: 'tentative', label: 'Tentative', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 border-red-300 text-red-700' }
];

interface NewEventModalProps {
  isOpen: boolean
  startTime: Date
  endTime: Date
  onClose: () => void
  onSave: (event: Omit<ExtendedCalendarEvent, 'id'>) => void
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  startTime,
  endTime,
  onClose,
  onSave
}) => {
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  // State for form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('meeting');
  const [status, setStatus] = useState<string>('confirmed');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Handle submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: Omit<ExtendedCalendarEvent, 'id'> = {
      title,
      type: type as any, // Type assertion since we know it's one of our defined types
      status: status as any, // Type assertion for status
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      location,
      description
    };
    
    onSave(newEvent);
    onClose();
    
    // Reset form
    setTitle('');
    setType('meeting');
    setStatus('confirmed');
    setLocation('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800">Create New Event</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date and time display */}
          <div className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                {formatDate(startTime)} 
              </div>
              <div className="text-sm text-gray-600">
                {formatTime(startTime)} - {formatTime(endTime)}
              </div>
            </div>
          </div>
          
          {/* Event title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title"
              required
            />
          </div>
          
          {/* Event type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {EVENT_TYPES.map((eventType) => (
                <div
                  key={eventType.id}
                  className={`
                    border rounded-md px-3 py-2 text-sm cursor-pointer transition-all
                    ${type === eventType.id ? eventType.color + ' ring-2 ring-offset-1' : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => setType(eventType.id)}
                >
                  {eventType.label}
                </div>
              ))}
            </div>
            
            {/* Event status */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              {EVENT_STATUSES.map((eventStatus) => (
                <div
                  key={eventStatus.id}
                  className={`
                    border rounded-md px-3 py-2 text-sm cursor-pointer transition-all
                    ${status === eventStatus.id ? eventStatus.color + ' ring-2 ring-offset-1' : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => setStatus(eventStatus.id)}
                >
                  {eventStatus.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Room, building, or online link"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add details about this event"
              rows={3}
            />
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mr-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!title.trim()}
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 