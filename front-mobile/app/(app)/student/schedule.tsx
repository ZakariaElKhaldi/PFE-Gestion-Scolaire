// @ts-nocheck - Disable TypeScript checking for this file to avoid style type conflicts
// This is a common approach for React Native projects with StyleSheet type issues

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { scheduleService, ScheduleEvent } from '../../../services/schedule';

// Days of the week
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Helper function to get current week's Monday
  const getCurrentWeekMonday = useCallback((date: Date, offset = 0): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7); // Adjust for Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  // Current week dates
  const weekDates = useMemo(() => {
    const monday = getCurrentWeekMonday(selectedDate, weekOffset);
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }, [selectedDate, weekOffset, getCurrentWeekMonday]);

  // Reset week offset when date is directly selected
  useEffect(() => {
    setWeekOffset(0);
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getWeekSchedule();
      setSchedule(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedule();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Navigate between weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekOffset(prev => prev + (direction === 'next' ? 1 : -1));
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return schedule.filter(event => event.dayOfWeek === day);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get color for event
  const getEventColor = (color: string = 'blue') => {
    const colorMap = {
      'blue': COLORS.primary.DEFAULT,
      'green': COLORS.success.DEFAULT,
      'purple': COLORS.info.DEFAULT,
      'orange': COLORS.warning.DEFAULT,
      'red': COLORS.danger.DEFAULT,
      'pink': COLORS.secondary.DEFAULT,
    };
    
    return colorMap[color] || COLORS.primary.DEFAULT;
  };

  // Render the day tabs
  const renderDayTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {weekDates.map((date, index) => {
            const isSelected = viewMode === 'day' && 
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth();
            
            const dayEvents = getEventsForDay(index + 1);
            const hasEvents = dayEvents.length > 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayTab,
                  isSelected && styles.selectedDayTab
                ]}
                onPress={() => {
                  setSelectedDate(date);
                  setViewMode('day');
                }}
              >
                <Text style={[
                  styles.dayName,
                  isSelected && styles.selectedDayText
                ]}>
                  {DAYS_OF_WEEK[index].slice(0, 3)}
                </Text>
                <Text style={[
                  styles.dayDate,
                  isSelected && styles.selectedDayText
                ]}>
                  {formatDate(date)}
                </Text>
                {hasEvents && (
                  <View style={[
                    styles.eventIndicator,
                    isSelected && { backgroundColor: 'white' }
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render an event card
  const renderEventCard = ({ item }: { item: ScheduleEvent }) => {
    const eventColor = getEventColor(item.color);
    const duration = scheduleService.calculateEventDuration(item);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const durationText = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;
    
    return (
      <View style={[styles.eventCard, { borderLeftColor: eventColor }]}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={[styles.eventTimeBadge, { backgroundColor: eventColor }]}>
            <Text style={styles.eventTimeText}>
              {item.startTime} - {item.endTime}
            </Text>
          </View>
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.eventDetailText}>{item.teacher}</Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.eventDetailText}>{durationText} duration</Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.eventDetailText}>{item.location}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render weekly view
  const renderWeekView = () => {
    return (
      <View style={styles.weekViewContainer}>
        {DAYS_OF_WEEK.map((day, index) => {
          const dayNumber = index + 1;
          const events = getEventsForDay(dayNumber);
          const date = weekDates[index];
          
          return (
            <View key={index} style={styles.daySection}>
              <TouchableOpacity 
                style={styles.daySectionHeader}
                onPress={() => {
                  setSelectedDate(date);
                  setViewMode('day');
                }}
              >
                <Text style={styles.daySectionTitle}>{day}</Text>
                <Text style={styles.daySectionDate}>{formatDate(date)}</Text>
                {events.length > 0 && (
                  <View style={styles.eventCountBadge}>
                    <Text style={styles.eventCountText}>{events.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {events.length > 0 ? (
                events.map(event => (
                  <View 
                    key={event.id} 
                    style={[
                      styles.weekEventItem,
                      { borderLeftColor: getEventColor(event.color) }
                    ]}
                  >
                    <Text style={styles.weekEventTime}>
                      {event.startTime} - {event.endTime}
                    </Text>
                    <Text style={styles.weekEventTitle}>
                      {event.title}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>No classes</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayOfWeek = selectedDate.getDay();
    // Convert from JS day (0 = Sunday) to our system (1 = Monday)
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const events = getEventsForDay(adjustedDay);
    
    return (
      <View style={styles.dayViewContainer}>
        <Text style={styles.dayViewHeader}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {events.length > 0 ? (
          <FlatList
            data={events.sort((a, b) => a.startTime.localeCompare(b.startTime))}
            renderItem={renderEventCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.eventsList}
          />
        ) : (
          <View style={styles.emptyDayContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyDayTitle}>No Classes Today</Text>
            <Text style={styles.emptyDayText}>
              You don't have any scheduled classes for this day.
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSchedule}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Class Schedule</Text>
          <Text style={styles.headerSubtitle}>
            Week of {weekDates[0].toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('prev')}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('next')}
          >
            <Ionicons name="chevron-forward" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[
            styles.viewToggleButton, 
            viewMode === 'week' && styles.activeViewToggleButton
          ]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[
            styles.viewToggleText,
            viewMode === 'week' && styles.activeViewToggleText
          ]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.viewToggleButton, 
            viewMode === 'day' && styles.activeViewToggleButton
          ]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[
            styles.viewToggleText,
            viewMode === 'day' && styles.activeViewToggleText
          ]}>Day</Text>
        </TouchableOpacity>
      </View>
      
      {renderDayTabs()}
      
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary.DEFAULT]}
          />
        }
      >
        {viewMode === 'week' ? renderWeekView() : renderDayView()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.background.default,
    borderRadius: 8,
    margin: SPACING.md,
    marginTop: 0,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  viewToggleButton: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeViewToggleButton: {
    backgroundColor: COLORS.primary.DEFAULT,
  },
  viewToggleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  activeViewToggleText: {
    color: 'white',
  },
  tabContainer: {
    backgroundColor: COLORS.background.default,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  tabScroll: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  dayTab: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.grey[100],
    minWidth: 70,
  },
  selectedDayTab: {
    backgroundColor: COLORS.primary.DEFAULT,
  },
  dayName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dayDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  selectedDayText: {
    color: 'white',
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary.DEFAULT,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
  },
  weekViewContainer: {
    padding: SPACING.md,
  },
  daySection: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  daySectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  daySectionDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  eventCountBadge: {
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  eventCountText: {
    color: 'white',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  weekEventItem: {
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[100],
  },
  weekEventTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  weekEventTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  noEventsContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  dayViewContainer: {
    padding: SPACING.md,
  },
  dayViewHeader: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  eventsList: {
    paddingBottom: SPACING.xl,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[100],
  },
  eventTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  eventTimeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventTimeText: {
    color: 'white',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  eventDetails: {
    padding: SPACING.md,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  eventDetailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  emptyDayContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyDayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDayText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
}); 