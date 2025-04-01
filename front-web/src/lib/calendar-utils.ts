import { CalendarEvent } from '@/types/calendar'

// Helper functions for the calendar

/**
 * Generate time slots for the calendar
 * @param startHour Starting hour (default: 8AM)
 * @param endHour Ending hour (default: 18PM/6PM)
 * @param interval Interval in minutes (default: 30)
 * @returns Array of time strings in format HH:MM
 */
export const generateTimeSlots = (startHour = 8, endHour = 18, interval = 30) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
};

/**
 * Format a date object to a time string
 * @param date Date object
 * @returns Formatted time string (e.g. "14:30")
 */
export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date to display the date only
 * @param date Date object
 * @returns Formatted date string (e.g. "Mon, Jan 15")
 */
export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
};

/**
 * Check if two dates are on the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if both dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

/**
 * Gets events for a specific day and time slot
 */
export function getEventsForDayAndTime(
  events: CalendarEvent[] | undefined,
  day: Date,
  timeSlot: string
): CalendarEvent[] {
  if (!events || events.length === 0) return []
  
  const [hours, minutes] = timeSlot.split(':').map(Number)
  const slotStart = new Date(day)
  slotStart.setHours(hours, minutes, 0, 0)
  
  // Calculate slot end - assume 30 min slots
  const slotEnd = new Date(slotStart)
  slotEnd.setMinutes(slotEnd.getMinutes() + 30)
  
  return events.filter(event => {
    // Handle all-day events
    if (event.isAllDay) {
      return isSameDay(new Date(event.start), day)
    }
    
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    
    // Check if event starts on this day
    const isOnSameDay = isSameDay(eventStart, day)
    if (!isOnSameDay) return false
    
    // Check if event overlaps with this time slot
    // Event starts before or at slot end AND event ends after or at slot start
    return (
      (eventStart < slotEnd && eventEnd >= slotStart) ||
      (hours === eventStart.getHours() && minutes === eventStart.getMinutes())
    )
  })
} 