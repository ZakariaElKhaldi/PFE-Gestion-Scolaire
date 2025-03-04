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
