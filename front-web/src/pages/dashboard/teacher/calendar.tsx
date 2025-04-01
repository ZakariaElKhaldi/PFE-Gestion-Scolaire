import { useState, useEffect, Fragment } from 'react'
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout'
import { User } from '../../../types/auth'
import { CalendarEvent, DragItem, OfficeHour } from '../../../types/calendar'
import { 
  Plus, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  Loader2, 
  Search, 
  Download, 
  Filter as FilterIcon, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  List,
  Clock,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  X,
  Settings,
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Info
} from 'lucide-react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useSocket } from '../../../hooks/use-socket'
import {
  CalendarGrid,
  EventFormModal,
  OfficeHoursManager
} from '../../../components/dashboard/teacher/calendar'
import { Menu, Transition } from '@headlessui/react'

// Available calendar views
type CalendarView = 'day' | 'week' | 'month' | 'agenda'

interface TeacherCalendarProps {
  user: User
}

// Helper function for class names
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Toast notification type
type ToastType = 'success' | 'error' | 'info'

interface Toast {
  type: ToastType
  message: string
  id: number
}

export default function TeacherCalendar({ user }: TeacherCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>()
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sidebarSection, setSidebarSection] = useState<'calendar' | 'event-types' | 'office-hours'>('calendar')
  const [showFilters, setShowFilters] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [eventFilters, setEventFilters] = useState({
    class: true,
    meeting: true,
    office_hours: true,
    exam: true,
    other: true
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  
  // Add a toast notification
  const addToast = (type: ToastType, message: string) => {
    const id = Date.now()
    setToasts(prev => [...prev, { type, message, id }])
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }
  
  // Get socket and fallback methods
  const { 
    socket, 
    error: socketError, 
    isConnected, 
    useFallback,
    getEvents,
    getOfficeHours,
    updateEvent: updateEventSocket,
    createEvent: createEventSocket,
    deleteEvent: deleteEventSocket,
    updateOfficeHour: updateOfficeHourSocket
  } = useSocket()

  // Load data (either via socket or fallback)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Try to get data via socket or fallback
        const fallbackEvents = getEvents(user.id);
        if (fallbackEvents) {
          console.log('Using fallback events data');
          setEvents(fallbackEvents);
          setIsLoading(false);
        }
        
        const fallbackOfficeHours = getOfficeHours(user.id);
        if (fallbackOfficeHours) {
          console.log('Using fallback office hours data');
          setOfficeHours(fallbackOfficeHours);
        }
        
        // If we're in fallback mode, display a non-blocking message
        if (useFallback) {
          setErrorMessage('Using offline mode. Some features may be limited.');
        } else {
          setErrorMessage(null);
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setErrorMessage('Could not load calendar data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user.id, getEvents, getOfficeHours, useFallback]);

  // Setup socket listeners (only when connected)
  useEffect(() => {
    if (socket && isConnected) {
      // Socket event listeners
      socket.on('eventsLoaded', (loadedEvents: CalendarEvent[]) => {
        setEvents(loadedEvents)
        setIsLoading(false)
      })

      socket.on('officeHoursLoaded', (loadedHours: OfficeHour[]) => {
        setOfficeHours(loadedHours)
      })

      socket.on('eventUpdated', (updatedEvent: CalendarEvent) => {
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
          )
        )
        setIsSaving(false)
        addToast('success', 'Event updated successfully')
      })

      socket.on('eventCreated', (newEvent: CalendarEvent) => {
        setEvents(prevEvents => [...prevEvents, newEvent])
        setIsSaving(false)
        addToast('success', 'Event created successfully')
      })

      socket.on('eventDeleted', (eventId: string) => {
        setEvents(prevEvents => 
          prevEvents.filter(event => event.id !== eventId)
        )
        setIsSaving(false)
        addToast('success', 'Event deleted successfully')
      })

      socket.on('officeHourUpdated', (updatedHour: OfficeHour) => {
        setOfficeHours(prevHours =>
          prevHours.map(hour =>
            hour.id === updatedHour.id ? updatedHour : hour
          )
        )
        setIsSaving(false)
        addToast('success', 'Office hours updated successfully')
      })

      // Handle socket errors
      // @ts-ignore - Ignoring type error for socket events
      socket.on('error', (error: any) => {
        console.error('Socket error:', error)
        setErrorMessage(`Error: ${error.message}`)
        setIsSaving(false)
        addToast('error', `Error: ${error.message}`)
      })

      socket.on('connect_error', () => {
        console.error('Socket connection error')
        setErrorMessage('Unable to connect to the server. Please check your internet connection.')
        setIsSaving(false)
      })

      socket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason)
        if (reason === 'io server disconnect') {
          setErrorMessage('Disconnected from server. Please refresh the page.')
        } else {
          setErrorMessage('Connection lost. Attempting to reconnect...')
        }
        setIsSaving(false)
      })

      return () => {
        socket.off('eventsLoaded')
        socket.off('officeHoursLoaded')
        socket.off('eventUpdated')
        socket.off('eventCreated')
        socket.off('eventDeleted')
        socket.off('officeHourUpdated')
        // @ts-ignore - Ignoring type error for socket events
        socket.off('error')
        socket.off('connect_error')
        socket.off('disconnect')
      }
    }
  }, [socket, isConnected])

  // Event handlers using either socket or fallback methods
  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    setIsSaving(true)
    updateEventSocket(updatedEvent);
    
    // If in fallback mode, update local state directly
    if (useFallback) {
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      setIsSaving(false)
      addToast('success', 'Event updated successfully')
    }
  }

  const handleCreateEvent = (newEvent: CalendarEvent) => {
    setIsSaving(true)
    createEventSocket(newEvent);
    
    // If in fallback mode, update local state directly
    if (useFallback) {
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setIsSaving(false)
      addToast('success', 'Event created successfully')
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    setIsSaving(true)
    deleteEventSocket(eventId);
    
    // If in fallback mode, update local state directly
    if (useFallback) {
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      setIsSaving(false)
      addToast('success', 'Event deleted successfully')
    }
  }

  const handleUpdateOfficeHour = (updatedHour: OfficeHour) => {
    setIsSaving(true)
    updateOfficeHourSocket(updatedHour);
    
    // If in fallback mode, update local state directly
    if (useFallback) {
      setOfficeHours(prevHours =>
        prevHours.map(hour =>
          hour.id === updatedHour.id ? updatedHour : hour
        )
      );
      setIsSaving(false)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = async (event: CalendarEvent) => {
    if (!socket) {
      setErrorMessage('Connection error. Please refresh the page and try again.');
      return;
    }

    try {
      setIsSaving(true);
      if (event.id && events.some(e => e.id === event.id)) {
        // @ts-ignore - Ignoring type error for socket emit
        await new Promise(resolve => socket.emit('updateEvent', event, resolve));
      } else {
        // @ts-ignore - Ignoring type error for socket emit
        await new Promise(resolve => socket.emit('createEvent', { ...event, teacherId: user.id }, resolve));
      }
      setIsEventModalOpen(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to save event. Please try again.');
      setIsSaving(false);
    }
  };

  const handleSaveOfficeHour = (hour: OfficeHour) => {
    setIsSaving(true);
    if (socket) {
      const payload = {
        ...hour,
        teacherId: user.id
      }
      socket.emit('updateOfficeHour', payload)
    } else {
      setErrorMessage('Connection error. Please refresh the page and try again.')
      setIsSaving(false);
    }
  }

  const handleDeleteOfficeHour = (hourId: string) => {
    setIsSaving(true);
    if (socket) {
      // @ts-ignore - Ignoring type error for socket emit event name
      socket.emit('deleteOfficeHour', hourId)
    } else {
      setErrorMessage('Connection error. Please refresh the page and try again.')
      setIsSaving(false);
    }
  }

  const handleAddOfficeHour = () => {
    // This function will be implemented to handle adding new office hours
    console.log("Add new office hour");
    // For now just open a new form
    setSidebarSection('office-hours');
  }

  const handleEventDrop = (item: DragItem, dropDate: Date) => {
    if (!socket) {
      setErrorMessage('Connection error. Please refresh the page and try again.')
      return
    }
    
    setIsSaving(true);
    const event = item.event
    
    // Calculate duration of the original event
    const originalStart = new Date(event.start)
    const originalEnd = new Date(event.end)
    const durationMs = originalEnd.getTime() - originalStart.getTime()
    
    // Create new dates based on the drop target
    const newStart = new Date(dropDate)
    const newEnd = new Date(newStart.getTime() + durationMs)
    
    const updatedEvent: CalendarEvent = {
      ...event,
      start: newStart.toISOString(),
      end: newEnd.toISOString()
    }
    
    socket.emit('updateEvent', updatedEvent)
  }

  // Function to retry loading data
  const handleRetryLoading = () => {
    setErrorMessage(null);
    setIsLoading(true);
    
    if (socket && isConnected) {
      socket.emit('getEvents', user.id);
      socket.emit('getOfficeHours', user.id);
    } else {
      // Use fallback data if socket is not available
      const fallbackEvents = getEvents(user.id);
      if (fallbackEvents) {
        setEvents(fallbackEvents);
        setIsLoading(false);
      }
      
      const fallbackOfficeHours = getOfficeHours(user.id);
      if (fallbackOfficeHours) {
        setOfficeHours(fallbackOfficeHours);
      }
    }
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);
    
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    
    if (calendarView === 'week') {
      // Navigate by 7 days for week view
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    }
    else if (calendarView === 'month') {
      // Navigate by month for month view
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    }
    else {
      // Navigate by day for agenda view
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    }
    
    setCurrentDate(newDate);
  };
  
  // Helper to get date range string
  const getDateRangeString = () => {
    switch (calendarView) {
      case 'month':
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'week': {
        // Calculate week range
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startOfWeek.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        } else if (startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
          return `${startOfWeek.toLocaleString('default', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleString('default', { month: 'short', day: 'numeric' })}, ${startOfWeek.getFullYear()}`;
        } else {
          return `${startOfWeek.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endOfWeek.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      }
      case 'agenda':
        return currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
      default:
        return '';
    }
  };

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    if (event.type === 'class' && !eventFilters.class) return false;
    if (event.type === 'meeting' && !eventFilters.meeting) return false;
    if (event.type === 'office_hours' && !eventFilters.office_hours) return false;
    if (event.type === 'exam' && !eventFilters.exam) return false;
    return true;
  });

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left sidebar */}
        {isSidebarOpen && (
          <div className="w-full lg:w-64 border-r border-gray-200 bg-white p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Calendar</h2>
                <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
                </button>
            </div>
            
            {/* Section tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-3 text-sm font-medium ${
                  sidebarSection === 'calendar'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSidebarSection('calendar')}
              >
                Calendar
              </button>
              <button
                className={`py-2 px-3 text-sm font-medium ${
                  sidebarSection === 'office-hours'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSidebarSection('office-hours')}
              >
                Office Hours
              </button>
            </div>
            
            {/* Create Event Button */}
              <button
              className="bg-primary text-white w-full py-2 px-4 rounded-md mb-6 flex items-center justify-center"
              onClick={() => {
                setSelectedEvent(undefined);
                setIsEventModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
              </button>
            
            {/* Section content */}
            {sidebarSection === 'calendar' && (
              <div className="flex-1 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Mini Calendar</h3>
                  {/* This would be a mini calendar component */}
                  <div className="bg-gray-50 rounded-md p-2 h-48 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Mini Calendar View</span>
            </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Upcoming Events</h3>
                    </div>
                  
                  {filteredEvents.length === 0 ? (
                    <div className="text-gray-500 text-xs p-2">No upcoming events</div>
                  ) : (
                    <div className="space-y-1">
                      {filteredEvents
                        .filter(e => new Date(e.start) > new Date())
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .slice(0, 3)
                        .map(event => (
                          <div 
                            key={event.id}
                            className={`bg-white border border-gray-200 rounded-md p-1.5 text-xs cursor-pointer 
                              hover:bg-gray-50 transition-all duration-150 relative 
                              ${event.type === 'class' ? 'hover:border-blue-300' : 
                              event.type === 'meeting' ? 'hover:border-purple-300' : 
                              event.type === 'office_hours' ? 'hover:border-green-300' : 
                              event.type === 'exam' ? 'hover:border-red-300' : 
                              'hover:border-gray-300'}`}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-center gap-1">
                              <div 
                                className={`h-2 w-2 rounded-full
                                  ${event.type === 'class' ? 'bg-blue-500' : 
                                  event.type === 'meeting' ? 'bg-purple-500' : 
                                  event.type === 'office_hours' ? 'bg-green-500' : 
                                  event.type === 'exam' ? 'bg-red-500' : 
                                  'bg-gray-500'}`} 
                              />
                              <div className="font-medium truncate">{event.title}</div>
                            </div>
                            <div className="text-gray-500 mt-1 text-[10px]">
                              {new Date(event.start).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                      </div>
                      
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CalendarCheck className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="text-sm font-medium text-gray-700">Office Hours</h3>
                    </div>
                        <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => setSidebarSection('office-hours')}
                    >
                      Manage
                        </button>
                  </div>
                  
                  {officeHours.length === 0 ? (
                    <div className="text-gray-500 text-xs p-2">No office hours scheduled</div>
                  ) : (
                    <div className="space-y-1">
                      {officeHours.slice(0, 3).map(hour => (
                        <div 
                          key={hour.id} 
                          className="flex items-center text-xs p-1 hover:bg-gray-50 rounded-md cursor-pointer transition-all duration-150"
                          onClick={() => setSidebarSection('office-hours')}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                          <div>
                            <span className="font-medium">{hour.dayOfWeek}</span>
                            <span className="mx-1 text-gray-400">·</span>
                            <span className="text-[10px]">{hour.startTime} - {hour.endTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                      </div>
                    </div>
                  )}
                  
                  {sidebarSection === 'office-hours' && (
              <div className="flex-1 overflow-y-auto">
                        <OfficeHoursManager
                          officeHours={officeHours}
                          onEdit={handleUpdateOfficeHour}
                          onDelete={handleDeleteOfficeHour}
                          onAdd={handleAddOfficeHour}
                        />
                      </div>
            )}
                    </div>
                  )}
        
        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <List className="h-5 w-5" />
              </button>
            )}
            
            {/* Connection status */}
            <div className="flex items-center">
              {useFallback ? (
                <div className="flex items-center bg-yellow-50 text-yellow-800 px-2 py-1 rounded-md text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Offline Mode
                </div>
              ) : isConnected ? (
                <div className="flex items-center bg-green-50 text-green-800 px-2 py-1 rounded-md text-xs">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                  Connected
                </div>
              ) : (
                <div className="flex items-center bg-red-50 text-red-800 px-2 py-1 rounded-md text-xs">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                  Disconnected
                </div>
              )}
            </div>
            
            {/* View switcher buttons */}
            <div className="flex items-center bg-gray-100 rounded-md mx-2">
              <button
                className={`px-3 py-1 text-xs rounded-md ${calendarView === 'day' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setCalendarView('day')}
              >
                Day
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md ${calendarView === 'week' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setCalendarView('week')}
              >
                Week
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md ${calendarView === 'month' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setCalendarView('month')}
              >
                Month
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2">
              <div 
                className={`px-2 py-1 rounded-full cursor-pointer text-xs flex items-center ${
                  eventFilters.class ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setEventFilters({...eventFilters, class: !eventFilters.class})}
              >
                <div className={`h-2 w-2 rounded-full ${eventFilters.class ? 'bg-blue-500' : 'bg-gray-400'} mr-1`}></div>
                Classes
              </div>
              
              <div 
                className={`px-2 py-1 rounded-full cursor-pointer text-xs flex items-center ${
                  eventFilters.meeting ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setEventFilters({...eventFilters, meeting: !eventFilters.meeting})}
              >
                <div className={`h-2 w-2 rounded-full ${eventFilters.meeting ? 'bg-purple-500' : 'bg-gray-400'} mr-1`}></div>
                Meetings
              </div>
              
              <div 
                className={`px-2 py-1 rounded-full cursor-pointer text-xs flex items-center ${
                  eventFilters.office_hours ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setEventFilters({...eventFilters, office_hours: !eventFilters.office_hours})}
              >
                <div className={`h-2 w-2 rounded-full ${eventFilters.office_hours ? 'bg-green-500' : 'bg-gray-400'} mr-1`}></div>
                Office Hours
              </div>
              
              <div 
                className={`px-2 py-1 rounded-full cursor-pointer text-xs flex items-center ${
                  eventFilters.exam ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setEventFilters({...eventFilters, exam: !eventFilters.exam})}
              >
                <div className={`h-2 w-2 rounded-full ${eventFilters.exam ? 'bg-red-500' : 'bg-gray-400'} mr-1`}></div>
                Exams
              </div>
            </div>
          </div>
          
          {/* Calendar area */}
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
              </div>
            ) : errorMessage && !useFallback ? (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <div className="text-red-500 mb-4">{errorMessage}</div>
                <button 
                  className="bg-primary text-white px-4 py-2 rounded-md"
                  onClick={handleRetryLoading}
                >
                  Retry
                </button>
              </div>
            ) : (
                <DndProvider backend={HTML5Backend}>
                  <CalendarGrid
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    onEventDrop={handleEventDrop}
                    onEventCreate={handleCreateEvent}
                    onEventDelete={handleDeleteEvent}
                    view={calendarView}
                    currentDate={currentDate}
                  />
                </DndProvider>
            )}
          </div>
              </div>
            </div>

      {/* Event modal */}
      {isEventModalOpen && (
        <EventFormModal
          event={selectedEvent}
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isSaving={isSaving}
        />
      )}
      
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-md shadow-md text-sm font-medium flex items-center gap-2 transition-all duration-300 transform translate-y-0
              ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                toast.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
                'bg-blue-100 text-blue-800 border border-blue-300'}`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {toast.type === 'info' && <Info className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
