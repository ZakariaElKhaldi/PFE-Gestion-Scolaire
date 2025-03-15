import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ======= Teacher-specific attendance routes =======

// Get attendance for a specific class on a specific date
router.get('/class/:classId/date/:date', 
  authorize(['teacher', 'administrator']), 
  attendanceController.getClassAttendance
);

// Submit bulk attendance for a class
router.post('/bulk', 
  authorize(['teacher', 'administrator']), 
  attendanceController.submitBulkAttendance
);

// Get attendance statistics for a class
router.get('/class/:classId/stats', 
  authorize(['teacher', 'administrator']), 
  attendanceController.getClassAttendanceStats
);

// Notify parents of absent students
router.post('/notify', 
  authorize(['teacher', 'administrator']), 
  attendanceController.notifyAbsentStudents
);

// Generate attendance report
router.get('/class/:classId/report', 
  authorize(['teacher', 'administrator']), 
  attendanceController.generateReport
);

// Get attendance dashboard statistics for a teacher
router.get('/dashboard-stats', 
  authorize(['teacher', 'administrator']), 
  attendanceController.getTeacherDashboardStats
);

// ======= Student-specific attendance routes =======
// These would be implemented later when needed

export const attendanceRoutes = router; 