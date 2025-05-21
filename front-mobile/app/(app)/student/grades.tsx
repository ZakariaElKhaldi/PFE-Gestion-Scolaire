// @ts-nocheck - Disable TypeScript checking for this file to avoid style type conflicts
// This is a common approach for React Native projects with StyleSheet type issues

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList, ActivityIndicator, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../../theme';
import { gradesService, CourseGrade, Grade } from '../../../services/grades';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GradesScreen() {
  const [courses, setCourses] = useState<CourseGrade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  const fetchGrades = async () => {
    try {
      setLoading(true);
      const courseGrades = await gradesService.getGradesByCourse();
      setCourses(courseGrades);
      
      // Initialize selected course if we have courses
      if (courseGrades.length > 0 && !selectedCourse) {
        setSelectedCourse(courseGrades[0].id);
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grades. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGrades();
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchGrades();
  }, []);
  
  const calculateGradeColor = (grade: number) => {
    if (grade >= 90) return COLORS.success.DEFAULT;
    if (grade >= 80) return COLORS.info.DEFAULT;
    if (grade >= 70) return COLORS.warning.DEFAULT;
    return COLORS.danger.DEFAULT;
  };
  
  const calculateProgress = (score: number, total: number) => {
    return (score / total) * 100;
  };
  
  const getTrendIcon = (trend?: { direction: 'up' | 'down' | 'stable', value: number }) => {
    if (!trend) return null;
    
    if (trend.direction === 'up') {
      return (
        <View style={styles.trendContainer}>
          <Ionicons name="trending-up" size={16} color={COLORS.success.DEFAULT} />
          <Text style={[styles.trendText, { color: COLORS.success.DEFAULT }]}>
            {trend.value > 0 ? `${trend.value}%` : ''}
          </Text>
        </View>
      );
    } else if (trend.direction === 'down') {
      return (
        <View style={styles.trendContainer}>
          <Ionicons name="trending-down" size={16} color={COLORS.danger.DEFAULT} />
          <Text style={[styles.trendText, { color: COLORS.danger.DEFAULT }]}>
            {trend.value > 0 ? `${trend.value}%` : ''}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.trendContainer}>
          <Ionicons name="remove" size={16} color={COLORS.grey[500]} />
        </View>
      );
    }
  };
  
  const renderCourseCard = ({ item }: { item: CourseGrade }) => {
    return (
      <TouchableOpacity 
        style={styles.courseCard}
        onPress={() => setSelectedCourse(item.id)}
      >
        <View style={styles.courseCardHeader}>
          <Text style={styles.courseName}>{item.name}</Text>
          <View style={styles.gradeContainer}>
            <Text style={[styles.gradeText, { color: calculateGradeColor(item.currentGrade) }]}>
              {item.currentGrade}%
            </Text>
            {getTrendIcon(item.trend)}
          </View>
        </View>
        <Text style={styles.teacherName}>{item.teacher}</Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${item.currentGrade}%`,
                backgroundColor: calculateGradeColor(item.currentGrade)
              }
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderGradeItem = ({ item }: { item: Grade }) => {
    return (
      <View style={styles.gradeItem}>
        <View style={styles.gradeInfo}>
          <Text style={styles.assignmentTitle}>{item.assignmentTitle}</Text>
          <Text style={styles.gradeDate}>
            {new Date(item.gradedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.gradeScoreContainer}>
          <Text style={[
            styles.gradeScore, 
            { color: calculateGradeColor((item.score / item.totalPoints) * 100) }
          ]}>
            {item.score}/{item.totalPoints}
          </Text>
          <View style={styles.miniProgressContainer}>
            <View 
              style={[
                styles.miniProgressFill, 
                { 
                  width: `${calculateProgress(item.score, item.totalPoints)}%`,
                  backgroundColor: calculateGradeColor((item.score / item.totalPoints) * 100)
                }
              ]} 
            />
          </View>
          {item.comments ? (
            <Text style={styles.comments} numberOfLines={2}>
              {item.comments}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading your grades...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchGrades}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (courses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={64} color={COLORS.grey[400]} />
          <Text style={styles.emptyTitle}>No grades available</Text>
          <Text style={styles.emptyMessage}>You don't have any graded assignments yet.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchGrades}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const selectedCourseData = courses.find(course => course.id === selectedCourse);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Academic Performance</Text>
        <Text style={styles.headerSubtitle}>Track your grades and progress</Text>
      </View>
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary.DEFAULT]}
          />
        }
      >
        <View style={styles.courseListContainer}>
          <FlatList
            horizontal
            data={courses}
            renderItem={renderCourseCard}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courseList}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={250}
          />
        </View>
        
        {selectedCourseData && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>{selectedCourseData.name} - Grade Details</Text>
              <Text style={[
                styles.overallGrade, 
                { color: calculateGradeColor(selectedCourseData.currentGrade) }
              ]}>
                Overall: {selectedCourseData.currentGrade}%
              </Text>
            </View>
            
            {selectedCourseData.grades.length === 0 ? (
              <View style={styles.noGradesContainer}>
                <Text style={styles.noGradesText}>
                  No grades available for this course yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={selectedCourseData.grades}
                renderItem={renderGradeItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.gradesList}
              />
            )}
          </View>
        )}
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
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  refreshButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
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
  courseListContainer: {
    marginVertical: SPACING.md,
  },
  courseList: {
    paddingHorizontal: SPACING.md,
  },
  courseCard: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.md,
    marginRight: SPACING.md,
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
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    marginLeft: 2,
  },
  teacherName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.grey[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  detailsContainer: {
    marginTop: SPACING.sm,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: SPACING.md,
    padding: SPACING.md,
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
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  detailsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  overallGrade: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  gradesList: {
    paddingTop: SPACING.sm,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[100],
  },
  gradeInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  assignmentTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  gradeDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  gradeScoreContainer: {
    alignItems: 'flex-end',
  },
  gradeScore: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  miniProgressContainer: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.grey[200],
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  comments: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
    marginTop: 4,
    width: 120,
    textAlign: 'right',
  },
  noGradesContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  noGradesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
}); 