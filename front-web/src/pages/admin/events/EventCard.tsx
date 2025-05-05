import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
    location: string;
    type: string;
    status: string;
    attendees: number;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'completed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'conference':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100';
      case 'webinar':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-100';
      case 'meeting':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'social':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{event.title}</CardTitle>
          <div className="flex gap-1">
            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
            <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(event.start, 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event.attendees} attendees</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit && onEdit(event.id)}
          className="h-8 px-2"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete && onDelete(event.id)}
          className="h-8 px-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
} 