import { User } from '../models/user.model';
import { Class } from '../models/class.model';
import { Course } from '../models/course.model';
import { Student } from '../models/student.model';
import { Attendance } from '../models/attendance.model';
import { Assignment } from '../models/assignment.model';
import { Feedback } from '../models/feedback.model';

export class TeacherService {
  /**
   * Get dashboard statistics for a teacher
   */
  async getDashboardStats(teacherId: string) {
    // Verify that the user exists and is a teacher
    const user = await User.findById(teacherId);
    if (!user || user.role !== 'teacher') {
      throw new Error('Teacher not found');
    }

    // Get classes data
    const classes = await Class.find({ teacherId });
    const classIds = classes.map(cls => cls._id);

    // Get students enrolled in these classes
    const enrolledStudents = await Student.find({ classId: { $in: classIds } });
    
    // Get attendance data
    const attendanceRecords = await Attendance.find({ 
      classId: { $in: classIds },
      date: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
      }
    });

    // Get attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.find({
      classId: { $in: classIds },
      date: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Calculate present, absent, late for today
    const todayPresent = todayAttendance.reduce((sum, record) => sum + record.presentCount, 0);
    const todayAbsent = todayAttendance.reduce((sum, record) => sum + record.absentCount, 0);
    const todayLate = todayAttendance.reduce((sum, record) => sum + record.lateCount, 0);
    const todayTotal = todayPresent + todayAbsent + todayLate;

    // Calculate present, absent, late for the week
    const weeklyPresent = attendanceRecords.reduce((sum, record) => sum + record.presentCount, 0);
    const weeklyAbsent = attendanceRecords.reduce((sum, record) => sum + record.absentCount, 0);
    const weeklyLate = attendanceRecords.reduce((sum, record) => sum + record.lateCount, 0);
    const weeklyTotal = weeklyPresent + weeklyAbsent + weeklyLate;

    // Get assignments data
    const assignments = await Assignment.find({ teacherId });
    
    // Get recent activity
    const recentAssignments = await Assignment.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentFeedback = await Feedback.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Combine and format recent activity
    const recentActivity = [
      ...recentAssignments.map(assignment => ({
        id: assignment._id,
        type: 'assignment',
        title: `New Assignment Created`,
        description: assignment.title,
        timestamp: assignment.createdAt,
        courseName: assignment.courseId // Need to populate course name in real implementation
      })),
      ...recentFeedback.map(feedback => ({
        id: feedback._id,
        type: 'feedback',
        title: `Feedback Provided`,
        description: feedback.content.substring(0, 50) + (feedback.content.length > 50 ? '...' : ''),
        timestamp: feedback.createdAt,
        studentName: feedback.studentId, // Need to populate student name in real implementation
        courseName: feedback.courseId // Need to populate course name in real implementation
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    // Calculate class statistics
    const activeClasses = classes.filter(cls => cls.status === 'active').length;
    const upcomingClasses = classes.filter(cls => cls.status === 'upcoming').length;
    const completedClasses = classes.filter(cls => cls.status === 'completed').length;

    // Calculate assignment statistics
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    const gradedAssignments = assignments.filter(a => a.status === 'graded').length;
    const upcomingAssignments = assignments.filter(a => 
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
    const classes = await Class.find({ teacherId });
    
    // Filter classes that have schedules on the requested day
    return classes
      .filter(cls => cls.schedule && cls.schedule.some(s => s.day.toLowerCase() === day.toLowerCase()))
      .map(cls => {
        const scheduleForDay = cls.schedule.find(s => s.day.toLowerCase() === day.toLowerCase());
        return {
          classId: cls._id,
          className: cls.name,
          courseName: cls.courseId, // Need to populate course name in real implementation
          room: cls.room,
          startTime: scheduleForDay?.startTime,
          endTime: scheduleForDay?.endTime,
          studentCount: cls.enrollmentCount || 0
        };
      })
      .sort((a, b) => {
        // Sort by start time
        if (!a.startTime || !b.startTime) return 0;
        const [aHours, aMinutes] = a.startTime.split(':').map(Number);
        const [bHours, bMinutes] = b.startTime.split(':').map(Number);
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
      });
  }

  /**
   * Get all students taught by a teacher
   */
  async getStudents(teacherId: string) {
    // Get classes taught by the teacher
    const classes = await Class.find({ teacherId });
    const classIds = classes.map(cls => cls._id);
    
    // Get students enrolled in these classes
    const students = await Student.find({ classId: { $in: classIds } });
    
    // Format student data
    return students.map(student => {
      return {
        id: student._id,
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
    const courses = await Course.find({ teacherId });
    
    // Format course data
    return courses.map(course => {
      return {
        id: course._id,
        name: course.name
      };
    });
  }
} 