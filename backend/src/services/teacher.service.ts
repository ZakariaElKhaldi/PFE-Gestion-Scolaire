import { userModel } from '../models/user.model';
import { classModel } from '../models/class.model';
import { courseModel } from '../models/course.model';
import { StudentModel } from '../models/student.model';
import { attendanceModel } from '../models/attendance.model';
import { assignmentModel } from '../models/assignment.model';
import { feedbackModel } from '../models/feedback.model';
import { assignmentService } from './assignment.service';
import { AssignmentSubmissionModel } from '../models/assignment-submission.model';

// Interface for schedule item
interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
}

export class TeacherService {
  /**
   * Get dashboard statistics for a teacher
   */
  async getDashboardStats(teacherId: string) {
    // Verify that the user exists and is a teacher
    const user = await userModel.findById(teacherId);
    if (!user || user.role !== 'teacher') {
      throw new Error('Teacher not found');
    }

    // Get classes data
    const classes = await classModel.findByTeacherId(teacherId);
    const classIds = classes.map(cls => cls.id);

    // Get students enrolled in these classes
    const enrolledStudents = await StudentModel.findByClassIds(classIds);
    
    // Get attendance data
    const attendanceRecords = await attendanceModel.findByClassIds(classIds, {
      fromDate: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
    });

    // Get attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await attendanceModel.findByClassIds(classIds, {
      fromDate: today,
      toDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    });

    // Calculate present, absent, late for today
    const todayPresent = todayAttendance.reduce((sum, record) => sum + (record.presentCount || 0), 0);
    const todayAbsent = todayAttendance.reduce((sum, record) => sum + (record.absentCount || 0), 0);
    const todayLate = todayAttendance.reduce((sum, record) => sum + (record.lateCount || 0), 0);
    const todayTotal = todayPresent + todayAbsent + todayLate;

    // Calculate present, absent, late for the week
    const weeklyPresent = attendanceRecords.reduce((sum, record) => sum + (record.presentCount || 0), 0);
    const weeklyAbsent = attendanceRecords.reduce((sum, record) => sum + (record.absentCount || 0), 0);
    const weeklyLate = attendanceRecords.reduce((sum, record) => sum + (record.lateCount || 0), 0);
    const weeklyTotal = weeklyPresent + weeklyAbsent + weeklyLate;

    // Get assignments data
    const assignments = await assignmentModel.findByTeacherId(teacherId);
    
    // Get recent activity
    const recentAssignments = await assignmentModel.findRecent(teacherId, 5);
    
    const recentFeedback = await feedbackModel.findRecentByTeacherId(teacherId, 5);
    
    // Combine and format recent activity
    const recentActivity = [
      ...recentAssignments.map(assignment => ({
        id: assignment.id,
        type: 'assignment',
        title: `New Assignment Created`,
        description: assignment.title || 'Untitled Assignment',
        timestamp: assignment.createdAt,
        courseName: assignment.courseId // Need to populate course name in real implementation
      })),
      ...recentFeedback.map(feedback => ({
        id: feedback.id,
        type: 'feedback',
        title: `Feedback Provided`,
        description: feedback.content ? (feedback.content.substring(0, 50) + (feedback.content.length > 50 ? '...' : '')) : 'No content',
        timestamp: feedback.createdAt,
        studentName: feedback.studentName || feedback.studentId || 'Unknown Student',
        courseName: feedback.courseName || feedback.courseId || 'Unknown Course'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    // Calculate class statistics
    const activeClasses = classes.filter(cls => cls.status === 'active').length;
    const upcomingClasses = classes.filter(cls => cls.status === 'upcoming').length;
    const completedClasses = classes.filter(cls => cls.status === 'completed').length;

    // Calculate assignment statistics
    const pendingAssignments = assignments.filter((a: any) => a.status === 'pending').length;
    const gradedAssignments = assignments.filter((a: any) => a.status === 'graded').length;
    const upcomingAssignments = assignments.filter((a: any) => 
      new Date(a.dueDate) > new Date() && a.status === 'pending'
    ).length;

    // Prepare dashboard stats
    return {
      classes: {
        total: classes.length,
        active: activeClasses,
        upcoming: upcomingClasses,
        completed: completedClasses
      },
      students: {
        total: enrolledStudents.length,
        averageAttendance: weeklyTotal ? Math.round((weeklyPresent / weeklyTotal) * 100) : 0,
        averagePerformance: 0 // Need to calculate from grades
      },
      assignments: {
        total: assignments.length,
        pending: pendingAssignments,
        graded: gradedAssignments,
        upcoming: upcomingAssignments
      },
      attendance: {
        today: {
          present: todayPresent,
          absent: todayAbsent,
          late: todayLate,
          total: todayTotal
        },
        weekly: {
          present: weeklyPresent,
          absent: weeklyAbsent,
          late: weeklyLate,
          total: weeklyTotal
        }
      },
      recentActivity
    };
  }

  /**
   * Get teacher's schedule for a specific day
   */
  async getScheduleByDay(teacherId: string, day: string) {
    // Get classes taught by the teacher
    const classes = await classModel.findByTeacherId(teacherId);
    
    // Get course information for better naming
    let courses: Record<string, any> = {};
    try {
      const allCourses = await courseModel.findAll();
      courses = allCourses.reduce((acc: Record<string, any>, course: any) => {
        acc[course.id] = course;
        return acc;
      }, {});
    } catch (error) {
      console.warn('Could not fetch course details', error);
    }
    
    // Filter classes that have schedules on the requested day
    return classes
      .filter(cls => cls && cls.schedule && Array.isArray(cls.schedule) && 
        cls.schedule.some((s: ScheduleItem) => s && s.day && s.day.toLowerCase() === day.toLowerCase()))
      .map(cls => {
        const scheduleForDay = cls.schedule.find((s: ScheduleItem) => 
          s && s.day && s.day.toLowerCase() === day.toLowerCase());
        
        // Get course info if available
        const courseInfo = courses[cls.courseId] || {};
        
        return {
          classId: cls.id || 'unknown',
          className: cls.name || 'Unknown Class',
          courseName: courseInfo.name || 'Course ' + cls.courseId || 'Unknown Course',
          courseCode: courseInfo.code || '',
          room: cls.room || 'TBD',
          startTime: scheduleForDay?.startTime || '',
          endTime: scheduleForDay?.endTime || '',
          studentCount: cls.enrollmentCount || 0
        };
      })
      .sort((a, b) => {
        // Sort by start time
        if (!a.startTime || !b.startTime) return 0;
        
        try {
          const [aHours, aMinutes] = a.startTime.split(':').map(Number);
          const [bHours, bMinutes] = b.startTime.split(':').map(Number);
          
          if (isNaN(aHours) || isNaN(aMinutes) || isNaN(bHours) || isNaN(bMinutes)) {
            return 0;
          }
          
          return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
        } catch (error) {
          return 0;
        }
      });
  }

  /**
   * Get all students taught by a teacher
   */
  async getStudents(teacherId: string) {
    // Get classes taught by the teacher
    const classes = await classModel.findByTeacherId(teacherId);
    const classIds = classes.map(cls => cls.id);
    
    // Get students enrolled in these classes
    const students = await StudentModel.findByClassIds(classIds);
    
    // Format student data
    return students.map(student => {
      return {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        profileImage: student.profileImage,
        className: student.classId, // Need to populate class name in real implementation
        attendance: 0, // Need to calculate from attendance records
        performanceScore: 0, // Need to calculate from grades
        lastActivity: new Date().toISOString() // Placeholder
      };
    });
  }

  /**
   * Get courses taught by a teacher
   */
  async getCourses(teacherId: string) {
    // Get courses taught by the teacher
    const courses = await courseModel.findByTeacherId(teacherId);
    
    // Format course data
    return courses.map(course => {
      return {
        id: course.id,
        name: course.name
      };
    });
  }

  /**
   * Check if a teacher is assigned to a course
   */
  async isTeacherAssignedToCourse(teacherId: string, courseId: string): Promise<boolean> {
    try {
      // Get the course
      const course = await courseModel.findById(courseId);
      
      // If course doesn't exist, teacher can't be assigned to it
      if (!course) {
        return false;
      }
      
      // Check if teacher is assigned to this course
      return course.teacherId === teacherId;
    } catch (error) {
      console.error('Error checking teacher course assignment:', error);
      return false;
    }
  }

  /**
   * Check if a teacher can grade a submission
   */
  async canTeacherGradeSubmission(teacherId: string, submissionId: string): Promise<boolean> {
    try {
      // Get the submission using the static method
      const submission = await AssignmentSubmissionModel.findById(submissionId);
      if (!submission) {
        return false;
      }
      
      // Get the assignment
      const assignment = await assignmentModel.findById(submission.assignmentId);
      if (!assignment) {
        return false;
      }
      
      // Get the course to check if teacher is assigned
      const course = await courseModel.findById(assignment.courseId);
      if (!course) {
        return false;
      }
      
      // Check if teacher is the owner of the course
      return course.teacherId === teacherId;
    } catch (error) {
      console.error('Error checking teacher grading permission:', error);
      return false;
    }
  }

  /**
   * Get assignments created by a teacher
   * This is a convenience method that uses assignmentService under the hood
   */
  async getAssignments(teacherId: string, filters?: {
    courseId?: string;
    status?: string;
  }): Promise<any[]> {
    try {
      // Make sure teacher exists
      const teacher = await userModel.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        throw new Error('Teacher not found');
      }
      
      // Get courses taught by this teacher
      const courses = await courseModel.findByTeacherId(teacherId);
      if (!courses || courses.length === 0) {
        return [];
      }

      // Get course IDs
      const courseIds = courses.map(course => course.id);
      
      // Filter by provided courseId if it exists and is taught by this teacher
      const finalCourseIds = filters?.courseId && courseIds.includes(filters.courseId) 
        ? [filters.courseId] 
        : courseIds;
      
      // Convert status string to valid assignment status
      const status = filters?.status as "draft" | "published" | "closed" | undefined;
      
      try {
        // Use assignmentService to get assignments
        return await assignmentService.getAssignments({
          courseId: finalCourseIds.length === 1 ? finalCourseIds[0] : undefined,
          status
        });
      } catch (error) {
        console.error('Error getting assignments from assignment service:', error);
        // Return empty array if assignment service fails
        return [];
      }
    } catch (error) {
      console.error('Error getting teacher assignments:', error);
      throw error;
    }
  }
} 