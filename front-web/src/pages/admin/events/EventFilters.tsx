import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function EventFilters() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleClearFilters = () => {
    setStatus(undefined);
    setType(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleApplyFilters = () => {
    const filters = {
      status,
      type,
      startDate,
      endDate,
    };
    console.log('Applying filters:', filters);
    // Here you would typically call a function to filter the events
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>Filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Event Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <DatePicker
            value={startDate}
            onChange={(date) => setStartDate(date)}
            placeholder="Select start date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <DatePicker
            value={endDate}
            onChange={(date) => setEndDate(date)}
            placeholder="Select end date"
          />
        </div>

        <Button className="w-full" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
} 