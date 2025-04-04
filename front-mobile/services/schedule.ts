import { apiClient } from '../utils/api-client';

export interface ScheduleEvent {
  id: string;
  title: string;
  teacher: string;
  startTime: string;
  endTime: string;
  location: string;
  dayOfWeek: number;
  courseId?: string;
  description?: string;
  color?: string;
}

class ScheduleService {
  private readonly basePath = '/students/schedule';

  /**
   * Get the week schedule for the current student
   */
  async getWeekSchedule(): Promise<ScheduleEvent[]> {
    // This is using mock data for now
    // In a real implementation, you would fetch from API:
    // const response = await apiClient.get<ScheduleEvent[]>(this.basePath);
    // return response;
    
    // Mock data based on web implementation
    return [
      {
        id: '1',
        title: 'Mathematics',
        teacher: 'Mr. Anderson',
        startTime: '08:00',
        endTime: '09:30',
        location: 'Room 101',
        dayOfWeek: 1,
        color: 'blue',
      },
      {
        id: '2',
        title: 'Physics',
        teacher: 'Dr. Johnson',
        startTime: '10:00',
        endTime: '11:30',
        location: 'Lab 203',
        dayOfWeek: 1,
        color: 'green',
      },
      {
        id: '3',
        title: 'English Literature',
        teacher: 'Ms. Parker',
        startTime: '13:00',
        endTime: '14:30',
        location: 'Room 105',
        dayOfWeek: 2,
        color: 'purple',
      },
      {
        id: '4',
        title: 'Computer Science',
        teacher: 'Prof. Williams',
        startTime: '15:00',
        endTime: '16:30',
        location: 'Lab 302',
        dayOfWeek: 3,
        color: 'orange',
      },
      {
        id: '5',
        title: 'History',
        teacher: 'Dr. Thompson',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Room 201',
        dayOfWeek: 4,
        color: 'red',
      },
      {
        id: '6',
        title: 'Art & Design',
        teacher: 'Ms. Rodriguez',
        startTime: '14:00',
        endTime: '15:30',
        location: 'Art Studio',
        dayOfWeek: 5,
        color: 'pink',
      },
    ];
  }

  /**
   * Get schedule for a specific day
   */
  async getDaySchedule(day: number): Promise<ScheduleEvent[]> {
    const weekSchedule = await this.getWeekSchedule();
    return weekSchedule.filter(event => event.dayOfWeek === day);
  }

  /**
   * Helper to calculate event duration in minutes
   */
  calculateEventDuration(event: ScheduleEvent): number {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinute = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinute = parseInt(event.endTime.split(':')[1]);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    
    return endInMinutes - startInMinutes;
  }
}

export const scheduleService = new ScheduleService(); 