import { CalendarEvent } from '@/types/calendar'

// Extended calendar event with isAllDay property
export interface ExtendedCalendarEvent extends CalendarEvent {
  isAllDay?: boolean;
}

// Calendar view types
export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

// Calendar day data type
export interface CalendarDayData {
  name: string;
  date: Date;
  dateString: string;
  isCurrentMonth?: boolean;
  events?: ExtendedCalendarEvent[];
} 