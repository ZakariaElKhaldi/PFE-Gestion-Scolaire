import { useState, useCallback } from 'react';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';
import { CalendarEvent, CalendarViewType, generateMockEvents } from '@/utils/calendarUtils';

interface CalendarState {
  currentDate: Date;
  view: CalendarViewType;
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isModalOpen: boolean;
}

interface CalendarActions {
  nextPeriod: () => void;
  prevPeriod: () => void;
  today: () => void;
  changeView: (view: CalendarViewType) => void;
  openModal: (event?: CalendarEvent) => void;
  closeModal: () => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
}

type UseCalendarReturn = CalendarState & CalendarActions;

export function useCalendar(): UseCalendarReturn {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'month',
    events: generateMockEvents(new Date(), 20),
    selectedEvent: null,
    isModalOpen: false,
  });

  const nextPeriod = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDate: 
        prev.view === 'month' ? addMonths(prev.currentDate, 1) :
        prev.view === 'week' ? addWeeks(prev.currentDate, 1) :
        addDays(prev.currentDate, 1)
    }));
  }, []);

  const prevPeriod = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDate: 
        prev.view === 'month' ? subMonths(prev.currentDate, 1) :
        prev.view === 'week' ? subWeeks(prev.currentDate, 1) :
        subDays(prev.currentDate, 1)
    }));
  }, []);

  const today = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDate: new Date()
    }));
  }, []);

  const changeView = useCallback((view: CalendarViewType) => {
    setState((prev) => ({
      ...prev,
      view
    }));
  }, []);

  const openModal = useCallback((event?: CalendarEvent) => {
    setState((prev) => ({
      ...prev,
      selectedEvent: event || null,
      isModalOpen: true
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedEvent: null,
      isModalOpen: false
    }));
  }, []);

  const addEvent = useCallback((event: CalendarEvent) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, { ...event, id: `event-${Date.now()}` }],
      isModalOpen: false,
      selectedEvent: null
    }));
  }, []);

  const updateEvent = useCallback((event: CalendarEvent) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === event.id ? event : e)),
      isModalOpen: false,
      selectedEvent: null
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
      isModalOpen: false,
      selectedEvent: null
    }));
  }, []);

  return {
    ...state,
    nextPeriod,
    prevPeriod,
    today,
    changeView,
    openModal,
    closeModal,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
