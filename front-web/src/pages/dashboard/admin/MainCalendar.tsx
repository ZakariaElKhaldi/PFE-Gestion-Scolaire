import React from 'react';
import { useCalendar } from '@/components/calendar/useCalendar';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import WeekView from '@/components/calendar/WeekView';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from '@/components/ui/use-toast';
import { getEventColors } from '@/utils/calendarUtils';
import * as XLSX from 'xlsx';
import { CalendarEvent } from '@/types/calendar';
import { eventColors } from '@/utils/colorOptions';

const Index = () => {
  const {
    currentDate,
    view,
    events,
    selectedEvent,
    isModalOpen,
    nextPeriod,
    prevPeriod,
    today,
    changeView,
    openModal,
    closeModal,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    color: '#1D4ED8',
    allDay: false,
    location: '',
  });

  React.useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        start: selectedEvent.start,
        end: selectedEvent.end,
        color: selectedEvent.color || '#1D4ED8',
        allDay: selectedEvent.allDay || false,
        location: selectedEvent.location || '',
      });
    } else {
      // Reset form for new event
      const newStart = new Date();
      newStart.setMinutes(0, 0, 0);
      const newEnd = new Date(newStart);
      newEnd.setHours(newStart.getHours() + 1);
      
      setFormData({
        title: '',
        description: '',
        start: newStart,
        end: newEnd,
        color: '#1D4ED8',
        allDay: false,
        location: '',
      });
    }
  }, [selectedEvent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'start' | 'end') => {
    const dateTime = new Date(e.target.value);
    setFormData((prev) => ({ ...prev, [field]: dateTime }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      id: selectedEvent?.id || `event-${Date.now()}`,
      ...formData,
    };
    
    if (selectedEvent) {
      updateEvent(eventData);
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
      });
    } else {
      addEvent(eventData);
      toast({
        title: "Event created",
        description: "Your new event has been created successfully.",
      });
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      toast({
        title: "Event deleted",
        description: "Your event has been deleted.",
        variant: "destructive",
      });
    }
  };

  const formatDateTimeForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };
  
  const handleCellClick = (date: Date, hour?: string) => {
    const newStart = new Date(date);
    if (hour) {
      const [hourStr] = hour.split(':');
      newStart.setHours(parseInt(hourStr, 10), 0, 0, 0);
    } else {
      newStart.setHours(9, 0, 0, 0); // Default to 9 AM
    }
    
    const newEnd = new Date(newStart);
    newEnd.setHours(newStart.getHours() + 1);
    
    setFormData((prev) => ({
      ...prev,
      start: newStart,
      end: newEnd,
    }));
    
    openModal();
  };

  const eventColors = getEventColors();
  
  // Function to export calendar events to Excel
  const exportCalendarToExcel = (events: CalendarEvent[]) => {
    // Convert events to a format suitable for Excel
    const formattedEvents = events.map(event => ({
      ID: event.id,
      Title: event.title,
      Description: event.description || '',
      Start: event.start.toISOString(),
      End: event.end.toISOString(),
      Color: event.color || '',
      AllDay: event.allDay ? 'Yes' : 'No',
      Location: event.location || '',
    }));

    // Create a worksheet from the formatted events
    const worksheet = XLSX.utils.json_to_sheet(formattedEvents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calendar Events');

    // Export the workbook to an Excel file
    XLSX.writeFile(workbook, 'calendar_events.xlsx');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button onClick={() => exportCalendarToExcel(events)}>Export to Excel</Button>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </header>
      
      <div className="flex-1 p-4 flex flex-col">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={changeView}
          onPrevious={prevPeriod}
          onNext={nextPeriod}
          onToday={today}
        />
        
        <div className="flex-1 mt-4 border rounded-md overflow-hidden">
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={openModal}
            onCellClick={handleCellClick}
          />
        </div>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={(open: boolean) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">Start</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.start)}
                    onChange={(e) => handleDateTimeChange(e, 'start')}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="end">End</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.end)}
                    onChange={(e) => handleDateTimeChange(e, 'end')}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Select 
                  value={formData.color} 
                  onChange={(color: string) => setFormData(prev => ({ ...prev, color }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-60 overflow-auto">
                      {Object.entries(eventColors).map(([name, color]) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                            <span className="capitalize">{name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedEvent ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
