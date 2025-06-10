import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { attendanceController } from '../controllers/attendance.controller';

const router = Router();

// Apply authentication middleware
router.use(authenticate);

// Teacher attendance routes
router.get('/courses', authorize(['teacher']), attendanceController.getTeacherCourses);
router.get('/courses/:courseId/students', authorize(['teacher']), attendanceController.getCourseStudents);
router.post('/mark', authorize(['teacher']), attendanceController.markAttendance);
router.get('/courses/:courseId', authorize(['teacher']), attendanceController.getAttendanceByDate);
router.get('/courses/:courseId/history', authorize(['teacher']), attendanceController.getCourseAttendanceHistory);
router.get('/courses/:courseId/summary', authorize(['teacher']), attendanceController.getCourseAttendanceSummary);
router.get('/courses/:courseId/students/:studentId/stats', authorize(['teacher']), attendanceController.getStudentAttendanceStats);

export default router;