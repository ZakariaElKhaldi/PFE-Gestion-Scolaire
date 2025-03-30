import { useEffect, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

interface ServerToClientEvents {
  eventsLoaded: (events: CalendarEvent[]) => void
  officeHoursLoaded: (hours: OfficeHour[]) => void
  eventUpdated: (event: CalendarEvent) => void
  eventCreated: (event: CalendarEvent) => void
  eventDeleted: (eventId: string) => void
  officeHourUpdated: (hour: OfficeHour) => void
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
}

interface ClientToServerEvents {
  getEvents: (userId: string) => void
  getOfficeHours: (userId: string) => void
  updateEvent: (event: CalendarEvent) => void
  createEvent: (event: CalendarEvent) => void
  deleteEvent: (eventId: string) => void
  updateOfficeHour: (hour: OfficeHour) => void
}

interface CalendarEvent {
  id: string
  title: string
  type: "class" | "office_hours" | "meeting" | "exam"
  start: string
  end: string
  location?: string
  description?: string
  attendees?: number
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
}

interface OfficeHour {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  location: string
  isRecurring: boolean
  maxStudents: number
  currentBookings: number
}

// Mock data to use when socket connection fails
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Mathematics Class',
    type: 'class',
    start: '2023-11-15T09:00:00',
    end: '2023-11-15T10:30:00',
    location: 'Room 101',
    attendees: 25,
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Office Hours',
    type: 'office_hours',
    start: '2023-11-16T14:00:00',
    end: '2023-11-16T16:00:00',
    location: 'Room 202',
    attendees: 0,
    status: 'scheduled'
  }
];

const mockOfficeHours: OfficeHour[] = [
  {
    id: '1',
    dayOfWeek: 'Monday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Office 302',
    isRecurring: true,
    maxStudents: 5,
    currentBookings: 2
  },
  {
    id: '2',
    dayOfWeek: 'Wednesday',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Office 302',
    isRecurring: true,
    maxStudents: 5,
    currentBookings: 0
  }
];

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [useFallback, setUseFallback] = useState(false)

  // Initialize socket connection with retry logic
  useEffect(() => {
    if (useFallback) return; // Skip socket connection if using fallback

    const maxRetries = 3;
    if (connectionAttempts >= maxRetries) {
      console.log('Max connection attempts reached, switching to fallback mode');
      setUseFallback(true);
      return;
    }

    try {
      console.log(`Attempting to connect to socket (attempt ${connectionAttempts + 1}/${maxRetries})...`);
      
      const socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Support both websocket and long-polling
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
        withCredentials: true,
        forceNew: true // Force a new connection to avoid conflicts
      }) as Socket<ServerToClientEvents, ClientToServerEvents>

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setError(null);
        setConnectionAttempts(0); // Reset connection attempts on successful connection
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setError(error);
        setIsConnected(false);
        
        // Only increment counter if it's a persistent failure
        if (connectionAttempts < maxRetries - 1) {
          setConnectionAttempts(prev => prev + 1);
        } else {
          console.log('Connection failed repeatedly, switching to fallback mode');
          setUseFallback(true);
        }
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        // Try to reconnect automatically for certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Server disconnected us or transport closed, try to reconnect
          console.log('Attempting to reconnect...');
          socketInstance.connect();
        }
      })

      setSocket(socketInstance);

      return () => {
        console.log('Cleaning up socket connection');
        socketInstance.disconnect();
      }
    } catch (err) {
      console.error('Error creating socket connection:', err);
      setConnectionAttempts(prev => prev + 1);
    }
  }, [connectionAttempts, useFallback])

  // Fallback methods to use when socket connection fails
  const getEvents = useCallback((userId: string) => {
    if (isConnected && socket) {
      socket.emit('getEvents', userId);
      return null; // Return null when using real socket
    } else {
      console.log('Using fallback events data');
      return mockEvents; // Return mock data when using fallback
    }
  }, [isConnected, socket]);

  const getOfficeHours = useCallback((userId: string) => {
    if (isConnected && socket) {
      socket.emit('getOfficeHours', userId);
      return null;
    } else {
      console.log('Using fallback office hours data');
      return mockOfficeHours;
    }
  }, [isConnected, socket]);

  const updateEvent = useCallback((event: CalendarEvent) => {
    if (isConnected && socket) {
      socket.emit('updateEvent', event);
    } else {
      console.log('Fallback: Event update would be sent to server', event);
    }
  }, [isConnected, socket]);

  const createEvent = useCallback((event: CalendarEvent) => {
    if (isConnected && socket) {
      socket.emit('createEvent', event);
    } else {
      console.log('Fallback: New event would be sent to server', event);
    }
  }, [isConnected, socket]);

  const deleteEvent = useCallback((eventId: string) => {
    if (isConnected && socket) {
      socket.emit('deleteEvent', eventId);
    } else {
      console.log('Fallback: Event deletion would be sent to server', eventId);
    }
  }, [isConnected, socket]);

  const updateOfficeHour = useCallback((hour: OfficeHour) => {
    if (isConnected && socket) {
      socket.emit('updateOfficeHour', hour);
    } else {
      console.log('Fallback: Office hour update would be sent to server', hour);
    }
  }, [isConnected, socket]);

  return { 
    socket, 
    error, 
    isConnected,
    useFallback,
    // Expose both raw socket and fallback methods
    getEvents,
    getOfficeHours,
    updateEvent,
    createEvent,
    deleteEvent,
    updateOfficeHour
  }
}
