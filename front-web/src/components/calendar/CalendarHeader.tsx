import { Button } from '@/components/ui/Button';
import { CalendarViewType, formatDateHeader } from '@/utils/calendarUtils';
import { ChevronLeft, ChevronRight, Calendar, Clock, LayoutGrid } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarViewType) => void;
}

export const CalendarHeader = ({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) => {
  return (
    <header className="glassmorphism sticky top-0 z-10 flex flex-col space-y-4 rounded-lg px-6 py-4 transition-all duration-300 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">{formatDateHeader(currentDate)}</h1>
        <div className="ml-6 flex space-x-2">
          <Button variant="outline" size="icon" onClick={onPrevious} aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext} aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" onClick={onToday} className="ml-2">
            Today
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex rounded-md border">
          <Button
            variant={view === 'month' ? 'default' : 'ghost'}
            className={`rounded-l-md rounded-r-none ${
              view === 'month' ? 'bg-primary text-white' : ''
            }`}
            onClick={() => onViewChange('month')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'ghost'}
            className={`rounded-none border-x-0 ${
              view === 'week' ? 'bg-primary text-white' : ''
            }`}
            onClick={() => onViewChange('week')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Week
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'ghost'}
            className={`rounded-l-none rounded-r-md ${
              view === 'day' ? 'bg-primary text-white' : ''
            }`}
            onClick={() => onViewChange('day')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Day
          </Button>
        </div>
      </div>
    </header>
  );
};
