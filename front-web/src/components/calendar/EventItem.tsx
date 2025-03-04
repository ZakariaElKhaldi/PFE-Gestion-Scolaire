import { CalendarEvent } from '@/utils/calendarUtils';
import { format } from 'date-fns';
import { Trash } from 'lucide-react';

interface EventItemProps {
  event: CalendarEvent;
  isInMonth?: boolean;
  onClick: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  isExpanded?: boolean;
}

export const EventItem = ({ event, isInMonth = true, onClick, onDelete, isExpanded = false }: EventItemProps) => {
  const { title, start, end, color, allDay, location } = event;
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(event.id);
  };
  
  const formatTime = (date: Date) => format(date, 'h:mm a');
  
  const timeDisplay = allDay 
    ? 'All day' 
    : `${formatTime(start)} - ${formatTime(end)}`;
  
  const heightClass = isExpanded ? 'h-auto' : 'h-6';
  const opacityClass = isInMonth ? 'opacity-100' : 'opacity-70';
  
  return (
    <div
      className={`calendar-event group ${heightClass} ${opacityClass} overflow-hidden`}
      style={{ backgroundColor: color }}
      onClick={() => onClick(event)}
    >
      <div className="flex items-center justify-between">
        <span className="truncate font-medium">{title}</span>
        {onDelete && (
          <button 
            onClick={handleDelete}
            className="ml-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/20"
          >
            <Trash className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-1 text-xs">
          <div>{timeDisplay}</div>
          {location && <div className="mt-1">{location}</div>}
        </div>
      )}
    </div>
  );
};
