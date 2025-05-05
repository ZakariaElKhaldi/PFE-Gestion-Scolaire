import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreateEventDialog } from './CreateEventDialog';
import { EventCard } from './EventCard';
import { EventFilters } from './EventFilters';
import { UserResponse } from '../../../types/auth';
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface EventsPageProps {
  user: UserResponse;
}

export default function EventsPage({ user }: EventsPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock events data
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'End of Year Ceremony',
      description: 'Annual ceremony to celebrate the end of the academic year and recognize student achievements.',
      start: new Date(2023, 5, 15, 10, 0),
      end: new Date(2023, 5, 15, 13, 0),
      location: 'Main Auditorium',
      type: 'conference',
      status: 'upcoming',
      attendees: 250,
    },
    {
      id: '2',
      title: 'Parent-Teacher Meeting',
      description: 'Quarterly meeting for parents to discuss student progress with teachers.',
      start: new Date(2023, 5, 20, 14, 0),
      end: new Date(2023, 5, 20, 18, 0),
      location: 'Classroom Block B',
      type: 'meeting',
      status: 'upcoming',
      attendees: 120,
    },
    {
      id: '3',
      title: 'Science Fair Workshop',
      description: 'Preparatory workshop for students participating in the annual science fair.',
      start: new Date(2023, 5, 10, 9, 0),
      end: new Date(2023, 5, 10, 12, 0),
      location: 'Science Lab',
      type: 'workshop',
      status: 'completed',
      attendees: 45,
    },
    {
      id: '4',
      title: 'Sports Day',
      description: 'Annual sports competition featuring various athletic events and team sports.',
      start: new Date(2023, 6, 5, 8, 0),
      end: new Date(2023, 6, 5, 17, 0),
      location: 'Sports Field',
      type: 'social',
      status: 'upcoming',
      attendees: 350,
    },
  ]);

  const handleEditEvent = (id: string) => {
    console.log('Edit event:', id);
    // Here you would typically open an edit dialog
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className={`${showFilters ? 'w-full md:w-1/4' : 'hidden'}`}>
            <EventFilters />
          </div>

          <div className={`w-full ${showFilters ? 'md:w-3/4' : 'w-full'}`}>
            <Card className="p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-96">
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="calendar">Calendar</TabsTrigger>
                      <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </Card>

            <div className="bg-white rounded-lg shadow">
              <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')}>
                <TabsContent value="calendar" className="p-4 min-h-[600px]">
                  <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    views={['month', 'week', 'day']}
                    eventPropGetter={(event) => {
                      let backgroundColor = '#3182ce';
                      switch (event.status) {
                        case 'upcoming':
                          backgroundColor = '#3182ce';
                          break;
                        case 'active':
                          backgroundColor = '#38a169';
                          break;
                        case 'completed':
                          backgroundColor = '#718096';
                          break;
                        case 'cancelled':
                          backgroundColor = '#e53e3e';
                          break;
                      }
                      return { style: { backgroundColor } };
                    }}
                  />
                </TabsContent>
                <TabsContent value="list" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No events found. Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <CreateEventDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      </div>
    </DashboardLayout>
  );
} 