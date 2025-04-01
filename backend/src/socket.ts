import { Server } from 'socket.io';
import http from 'http';

// Define types for events
interface ServerToClientEvents {
  eventsLoaded: (events: CalendarEvent[]) => void;
  officeHoursLoaded: (hours: OfficeHour[]) => void;
  eventUpdated: (event: CalendarEvent) => void;
  eventCreated: (event: CalendarEvent) => void;
  eventDeleted: (eventId: string) => void;
  officeHourUpdated: (hour: OfficeHour) => void;
}

interface ClientToServerEvents {
  getEvents: (userId: string) => void;
  getOfficeHours: (userId: string) => void;
  updateEvent: (event: CalendarEvent) => void;
  createEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  updateOfficeHour: (hour: OfficeHour) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "class" | "office_hours" | "meeting" | "exam";
  start: string;
  end: string;
  location?: string;
  description?: string;
  attendees?: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

interface OfficeHour {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  isRecurring: boolean;
  maxStudents: number;
  currentBookings: number;
}

// Placeholder data for demo purposes
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

/**
 * Sets up Socket.IO server and event handlers
 * @param httpServer The HTTP server to attach Socket.IO to
 * @returns The configured Socket.IO server instance
 */
export function setupSocketIO(httpServer: http.Server) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',  // Vite development server
        'http://localhost:3000',  // Alternate development port
        'http://127.0.0.1:5173',  // Using IP instead of localhost
        'http://127.0.0.1:3000'   // Alternate with IP
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    // Adding transport and connection settings to ensure reliability
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Debug connection events
  io.engine.on("connection_error", (err) => {
    console.log("Connection error:", err.message);
    console.log("Connection error details:", err.context);
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('getEvents', (userId) => {
      console.log(`Fetching events for user: ${userId}`);
      // In a real app, you would fetch events from a database for this user
      socket.emit('eventsLoaded', mockEvents);
    });

    socket.on('getOfficeHours', (userId) => {
      console.log(`Fetching office hours for user: ${userId}`);
      // In a real app, you would fetch office hours from a database for this user
      socket.emit('officeHoursLoaded', mockOfficeHours);
    });

    socket.on('updateEvent', (event) => {
      console.log('Updating event:', event);
      // In a real app, you would update the event in your database
      // For now, we'll just emit it back to all clients
      io.emit('eventUpdated', event);
    });

    socket.on('createEvent', (event) => {
      console.log('Creating event:', event);
      // In a real app, you would save the event to your database
      // For now, we'll just emit it back to all clients
      io.emit('eventCreated', event);
    });

    socket.on('deleteEvent', (eventId) => {
      console.log('Deleting event:', eventId);
      // In a real app, you would delete the event from your database
      // For now, we'll just emit it back to all clients
      io.emit('eventDeleted', eventId);
    });

    socket.on('updateOfficeHour', (hour) => {
      console.log('Updating office hour:', hour);
      // In a real app, you would update the office hour in your database
      // For now, we'll just emit it back to all clients
      io.emit('officeHourUpdated', hour);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
} 