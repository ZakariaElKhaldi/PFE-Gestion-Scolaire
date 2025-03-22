import { Request, Response } from 'express';
import { studentService } from '../services/student.service';
import { upload } from '../controllers/document.controller';
import { StudentModel } from '../models/student.model';
import { assignmentModel } from '../models/assignment.model';
import { AssignmentSubmissionModel, CreateAssignmentSubmissionDTO } from '../models/assignment-submission.model';
import { DocumentModel, CreateDocumentDTO } from '../models/document.model';
import { Document } from '../types/documents';
import * as fs from 'fs';
import { 
  getFileUrl, 
  saveFile, 
  FileInfo, 
  isFileTypeAllowed, 
  isFileSizeAllowed,
  streamFileToResponse
} from '../utils/file-utils';
import { 
  sendSuccess, 
  sendCreated, 
  sendBadRequest, 
  sendNotFound, 
  sendForbidden,
  sendUnauthorized
} from '../utils/response.utils';
import { asyncHandler } from '../middlewares/error.middleware';
import { attendanceModel } from '../models/attendance.model';
import { classScheduleModel } from '../models/class-schedule.model';
import { userModel } from '../models/user.model';

class StudentController {
  /**
   * Get student dashboard data
   */
  getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }

    try {
      // Get user details
      let userDetails = null;
      try {
        userDetails = await userModel.findById(studentId);
        console.log('User details fetched:', !!userDetails);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
      
      // Get all the dashboard data components with error handling for each
      let courses = [];
      try {
        courses = await StudentModel.getStudentCourses(studentId);
        console.log('Courses fetched:', courses.length);
      } catch (error) {
        console.error('Error fetching student courses:', error);
      }
      
      let upcomingAssignments = [];
      try {
        upcomingAssignments = await StudentModel.getUpcomingAssignments(studentId);
        console.log('Upcoming assignments fetched:', upcomingAssignments.length);
      } catch (error) {
        console.error('Error fetching upcoming assignments:', error);
      }
      
      let recentGrades = [];
      try {
        recentGrades = await StudentModel.getRecentGrades(studentId);
        console.log('Recent grades fetched:', recentGrades.length);
      } catch (error) {
        console.error('Error fetching recent grades:', error);
      }
      
      let attendanceStats = { present: 0, absent: 0, late: 0, excused: 0, total: 0, percentage: 0 };
      try {
        attendanceStats = await StudentModel.getAttendanceStats(studentId);
        console.log('Attendance stats fetched:', !!attendanceStats);
      } catch (error) {
        console.error('Error fetching attendance stats:', error);
      }
      
      // Get today's schedule - using the current day of the week
      let todaySchedule: Array<{ time: string; subject: string; teacher: string; room: string }> = [];
      try {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()] as any; // Cast to any to avoid type errors
        console.log('Fetching schedule for day:', today);
        const rawSchedule = await classScheduleModel.getStudentScheduleByDay(studentId, today);
        console.log('Today schedule fetched:', rawSchedule.length);
        
        // Format the schedule in the way the frontend expects it
        todaySchedule = rawSchedule.map(item => ({
          time: `${item.startTime} - ${item.endTime}`,
          subject: item.courseName,
          teacher: 'Teacher',  // We don't have teacher name in the data
          room: item.room || 'TBD'
        }));
      } catch (error) {
        console.error('Error fetching today schedule:', error);
      }
      
      // Combine into a dashboard object
      const dashboardData = {
        courses: courses || [],
        upcomingAssignments: upcomingAssignments || [],
        recentGrades: recentGrades || [],
        attendanceStats: attendanceStats || { present: 0, absent: 0, late: 0, excused: 0, total: 0, percentage: 0 },
        schedule: [{
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          periods: todaySchedule || []
        }]
      };
      
      console.log('Dashboard data ready to send');
      return sendSuccess(res, dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return sendSuccess(res, {
        courses: [],
        upcomingAssignments: [],
        recentGrades: [],
        attendanceStats: { present: 0, absent: 0, late: 0, excused: 0, total: 0, percentage: 0 },
        schedule: [{
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          periods: []
        }]
      });
    }
  });

  /**
   * Get courses for a student
   */
  getStudentCourses = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    const filters = {
      status,
      search
    };
    
    const courses = await StudentModel.getStudentCourses(studentId, filters);
    return sendSuccess(res, { courses });
  });

  /**
   * Get upcoming assignments for a student
   */
  getUpcomingAssignments = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    const assignments = await StudentModel.getUpcomingAssignments(studentId, limit || 5);
    return sendSuccess(res, { assignments });
  });

  /**
   * Get recent grades for a student
   */
  getRecentGrades = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    const grades = await StudentModel.getRecentGrades(studentId, limit || 5);
    return sendSuccess(res, { grades });
  });

  /**
   * Get attendance stats for a student
   */
  getAttendanceStats = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    const attendance = await StudentModel.getAttendanceStats(studentId);
    return sendSuccess(res, { attendance });
  });

  /**
   * Get submissions for the current student
   */
  getStudentSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.userId;
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    // Get submissions for the student
    const submissions = await AssignmentSubmissionModel.findByStudent(studentId);
    
    // Enhance with assignment details
    const enhancedSubmissions = await Promise.all(submissions.map(async (submission) => {
      const assignment = await assignmentModel.findById(submission.assignmentId);
      
      return {
        ...submission,
        submittedAt: submission.submittedAt.toISOString(),
        gradedAt: submission.gradedAt ? submission.gradedAt.toISOString() : undefined,
        assignment: assignment ? {
          title: assignment.title,
          dueDate: assignment.dueDate.toISOString(),
          totalPoints: assignment.totalPoints,
          courseId: assignment.courseId
        } : undefined
      };
    }));
    
    return sendSuccess(res, { submissions: enhancedSubmissions });
  });

  /**
   * Submit an assignment
   */
  submitAssignment = asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId;
    const studentId = req.user?.userId;
    const { content } = req.body;
      
    if (!studentId) {
      // Clean up uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return sendUnauthorized(res, 'Authentication required');
    }
    
    // Check if assignment exists
    const assignment = await assignmentModel.findById(assignmentId);
    
    if (!assignment) {
      // Clean up uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return sendNotFound(res, 'Assignment not found');
    }
    
    // Check if submission deadline has passed
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;
    const status = isLate ? 'late' : 'submitted';
    
    // Check if student is enrolled in the course
    const isEnrolled = await StudentModel.isEnrolledInCourse(studentId, assignment.courseId);
    
    if (!isEnrolled) {
      // Clean up uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return sendForbidden(res, 'You are not enrolled in this course');
    }
    
    // Check if student has already submitted this assignment
    // We need to search by assignment ID and student ID - this method needs to be implemented
    const submissions = await AssignmentSubmissionModel.findByAssignment(assignmentId);
    const existingSubmission = submissions.find(sub => sub.studentId === studentId);
    
    // Handle file upload (if provided)
    let documentId = undefined;
    
    if (req.file) {
      // If there's an existing submission with a document, we need to delete the document
      if (existingSubmission && existingSubmission.documentId) {
        // Find the document to get its file path
        const document = await DocumentModel.findById(existingSubmission.documentId);
        if (document && document.path && fs.existsSync(document.path)) {
          fs.unlinkSync(document.path);
        }
        
        // Delete the document record
        await DocumentModel.delete(existingSubmission.documentId);
      }
      
      // Create a new document for the assignment submission
      const fileUrl = getFileUrl(req.file.filename);
      
      const documentData: CreateDocumentDTO = {
        userId: studentId,
        title: `Assignment Submission: ${assignment.title}`,
        description: content || 'Assignment submission file',
        type: 'assignment_submission',
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        status: 'approved' as 'pending' | 'approved' | 'rejected' // Auto-approve assignment submission documents
      };
      
      // Create document record
      const document = await DocumentModel.create(documentData);
      documentId = document.id;
    }
    
    // Prepare submission data
    const submissionData: CreateAssignmentSubmissionDTO = {
      assignmentId,
      studentId,
      documentId,
      status
    };
    
    let submission;
    
    if (existingSubmission) {
      // Update existing submission
      await AssignmentSubmissionModel.update(existingSubmission.id, submissionData);
      submission = await AssignmentSubmissionModel.findById(existingSubmission.id);
    } else {
      // Create new submission
      const newSubmission = await AssignmentSubmissionModel.create(submissionData);
      submission = newSubmission;
    }
    
    // Transform the submission data to match frontend expectations
    const formattedSubmission = {
      ...submission,
      submittedAt: submission?.submittedAt.toISOString(),
      gradedAt: submission?.gradedAt ? submission.gradedAt.toISOString() : undefined,
      assignmentTitle: assignment.title,
      courseName: assignment.courseId // We should fetch course name here if needed by frontend
    };
    
    return sendCreated(res, { submission: formattedSubmission }, 'Assignment submitted successfully');
  });

  /**
   * Download a submitted assignment
   */
  downloadSubmission = asyncHandler(async (req: Request, res: Response) => {
    const submissionId = req.params.submissionId;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) {
      return sendUnauthorized(res, 'Authentication required');
    }
    
    // Get the submission
    const submission = await AssignmentSubmissionModel.findById(submissionId);
    
    if (!submission) {
      return sendNotFound(res, 'Submission not found');
    }
    
    // Check permissions
    if (userRole !== 'admin' && userRole !== 'teacher' && submission.studentId !== userId) {
      return sendForbidden(res, 'You do not have permission to download this submission');
    }
    
    // Check if submission has a document
    if (!submission.documentId) {
      return sendNotFound(res, 'No file attached to this submission');
    }
    
    // Get the document
    const document = await DocumentModel.findById(submission.documentId);
    
    if (!document || !document.path) {
      return sendNotFound(res, 'Submission file not found');
    }
    
    // Send the file
    return res.download(document.path, document.title || 'assignment-submission.pdf');
  });

  /**
   * Get detailed attendance records for a student
   */
  getDetailedAttendance = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    // Extract filter parameters
    const courseId = req.query.courseId as string;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const status = req.query.status as 'present' | 'absent' | 'late' | 'excused';
    
    // Get attendance records with filters
    const attendanceRecords = await attendanceModel.getByStudentId(studentId, {
      courseId,
      month,
      year,
      status
    });
    
    return sendSuccess(res, { attendance: attendanceRecords });
  });

  /**
   * Get monthly attendance summary for a student
   */
  getMonthlyAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    const monthlySummary = await attendanceModel.getMonthlyAttendanceSummary(studentId, year);
    
    return sendSuccess(res, { monthlySummary });
  });

  /**
   * Get student schedule
   */
  getStudentSchedule = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    // Get schedule for all days
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedulePromises = days.map(day => 
      classScheduleModel.getStudentScheduleByDay(studentId, day as any)
    );
    
    const scheduleResults = await Promise.all(schedulePromises);
    
    // Format the schedule data
    const formattedSchedule = days.map((day, index) => {
      const daySchedule = scheduleResults[index];
      
      if (daySchedule.length === 0) {
        return null;
      }
      
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        periods: daySchedule.map(period => ({
          id: period.id,
          time: `${period.startTime} - ${period.endTime}`,
          subject: period.courseName,
          code: period.courseCode,
          room: period.room
        }))
      };
    }).filter(Boolean);
    
    return sendSuccess(res, { schedule: formattedSchedule });
  });

  /**
   * Download attendance report
   */
  downloadAttendanceReport = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId || (req.user?.userId as string);
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const courseId = req.query.courseId as string;
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    // Get attendance records with filters
    const attendanceRecords = await attendanceModel.getByStudentId(studentId, {
      courseId,
      month,
      year
    });
    
    // Get attendance statistics
    const stats = await attendanceModel.getAttendanceStats(studentId, courseId);
    
    // Get student details
    const student = await StudentModel.findById(studentId);
    
    if (!student) {
      return sendNotFound(res, 'Student not found');
    }
    
    // Create CSV content
    let csvContent = 'Date,Course,Status,Notes\n';
    
    attendanceRecords.forEach(record => {
      csvContent += `${record.date},${record.courseName} (${record.courseCode}),${record.status},${record.notes || ''}\n`;
    });
    
    // Add summary
    csvContent += '\nSummary\n';
    csvContent += `Total Classes,${stats.total}\n`;
    csvContent += `Present,${stats.present}\n`;
    csvContent += `Absent,${stats.absent}\n`;
    csvContent += `Late,${stats.late}\n`;
    csvContent += `Excused,${stats.excused}\n`;
    csvContent += `Attendance Rate,${stats.percentage}%\n`;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_report_${student.firstName}_${student.lastName}.csv"`);
    
    return res.send(csvContent);
  });
}

export const studentController = new StudentController();
export default studentController; 