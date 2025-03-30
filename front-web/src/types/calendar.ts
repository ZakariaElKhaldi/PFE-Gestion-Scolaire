export interface CalendarEvent {
  id: string
  title: string
  type: "class" | "office_hours" | "meeting" | "exam"
  start: string
  end: string
  location?: string
  description?: string
  attendees?: number
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  isAllDay?: boolean
}

export interface OfficeHour {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  location: string
  isRecurring: boolean
  maxStudents: number
  currentBookings: number
}

export interface DragItem {
  type: string
  event: CalendarEvent
}
