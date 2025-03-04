import { addDays, addMonths, format, getDay, getDaysInMonth, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';

export type CalendarViewType = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  allDay?: boolean;
  location?: string;
}

export function getDaysInMonthGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const firstWeekStart = startOfWeek(monthStart);
  const days: Date[] = [];
  
  // Generate 42 days (6 weeks) to ensure we have enough days for the month view
  for (let i = 0; i < 42; i++) {
    days.push(addDays(firstWeekStart, i));
  }
  
  return days;
}

export function getDaysInWeek(date: Date): Date[] {
  const weekStart = startOfWeek(date);
  const days: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekStart, i));
  }
  
  return days;
}

export function getHoursInDay(): string[] {
  const hours: string[] = [];
  
  for (let i = 0; i < 24; i++) {
    hours.push(`${i}:00`);
  }
  
  return hours;
}

export function formatDateHeader(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function formatDateCell(date: Date): string {
  return format(date, 'd');
}

export function formatWeekdayHeader(date: Date): string {
  return format(date, 'EEE');
}

export function formatTimeHour(hour: string): string {
  const [h] = hour.split(':');
  const hourNum = parseInt(h, 10);
  
  if (hourNum === 0) {
    return '12 AM';
  }
  if (hourNum === 12) {
    return '12 PM';
  }
  if (hourNum < 12) {
    return `${hourNum} AM`;
  }
  return `${hourNum - 12} PM`;
}

export function getEventColors(): Record<string, string> {
  return {
    blue: '#1D4ED8',
    green: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1',
  };
}

export function generateMockEvents(start: Date, count: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const colors = Object.values(getEventColors());
  
  for (let i = 0; i < count; i++) {
    const eventDay = addDays(start, Math.floor(Math.random() * 30));
    const startHour = Math.floor(Math.random() * 12) + 8; // Between 8 AM and 8 PM
    const durationHours = Math.floor(Math.random() * 3) + 1; // 1 to 3 hours
    
    const eventStart = new Date(eventDay);
    eventStart.setHours(startHour, 0, 0, 0);
    
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventStart.getHours() + durationHours, 0, 0, 0);
    
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    events.push({
      id: `event-${i}`,
      title: `Event ${i + 1}`,
      description: `Description for event ${i + 1}`,
      start: eventStart,
      end: eventEnd,
      color: colors[colorIndex],
      allDay: Math.random() > 0.8, // 20% chance of being an all-day event
      location: Math.random() > 0.5 ? 'Office' : 'Virtual Meeting',
    });
  }
  
  return events;
}
