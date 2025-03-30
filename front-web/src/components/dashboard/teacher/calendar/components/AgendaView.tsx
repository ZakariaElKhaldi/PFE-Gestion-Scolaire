import React from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import type { ExtendedCalendarEvent } from '../types'

interface AgendaViewProps {
  events: ExtendedCalendarEvent[]
  onEventClick: (event: ExtendedCalendarEvent) => void
  isHappeningNow: (event: ExtendedCalendarEvent) => boolean
}

export const AgendaView: React.FC<AgendaViewProps> = ({ 
  events, 
  onEventClick, 
  isHappeningNow 
}) => {
  const todayEvents = events.filter(event => 
    new Date(event.start).toDateString() === new Date().toDateString()
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  const upcomingEvents = events.filter(event => 
    new Date(event.start).toDateString() !== new Date().toDateString() && 
    new Date(event.start) > new Date()
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  .slice(0, 5); // Show only next 5 events
  
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {/* Today's Events Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Today - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {todayEvents.length === 0 ? (
          <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            No events scheduled for today
          </div>
        ) : (
          <div className="space-y-3">
            {todayEvents.map(event => (
              <div 
                key={`agenda-today-${event.id}`}
                onClick={() => onEventClick(event)}
                className={`
                  p-4 rounded-lg border border-l-4 cursor-pointer transition-all hover:shadow-sm
                  ${event.type === 'class' ? 'border-blue-200 border-l-blue-500 bg-blue-50 hover:bg-blue-100/50' :
                    event.type === 'meeting' ? 'border-purple-200 border-l-purple-500 bg-purple-50 hover:bg-purple-100/50' :
                    event.type === 'office_hours' ? 'border-green-200 border-l-green-500 bg-green-50 hover:bg-green-100/50' :
                    event.type === 'exam' ? 'border-red-200 border-l-red-500 bg-red-50 hover:bg-red-100/50' : 
                    'border-gray-200 border-l-gray-500 bg-gray-50 hover:bg-gray-100/50'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(event.start).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true
                      })} - {new Date(event.end).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  
                  {isHappeningNow(event) && (
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                      Now
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Upcoming Events Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Events</h3>
        {upcomingEvents.length === 0 ? (
          <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            No upcoming events
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div 
                key={`agenda-upcoming-${event.id}`}
                onClick={() => onEventClick(event)}
                className={`
                  p-4 rounded-lg border border-l-4 cursor-pointer transition-all hover:shadow-sm
                  ${event.type === 'class' ? 'border-blue-200 border-l-blue-500 bg-blue-50/50 hover:bg-blue-100/30' :
                    event.type === 'meeting' ? 'border-purple-200 border-l-purple-500 bg-purple-50/50 hover:bg-purple-100/30' :
                    event.type === 'office_hours' ? 'border-green-200 border-l-green-500 bg-green-50/50 hover:bg-green-100/30' :
                    event.type === 'exam' ? 'border-red-200 border-l-red-500 bg-red-50/50 hover:bg-red-100/30' : 
                    'border-gray-200 border-l-gray-500 bg-gray-50/50 hover:bg-gray-100/30'
                  }
                `}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(event.start).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(event.start).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 