import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();
const teacherController = new TeacherController();

// Middleware to check if user is authenticated and is a teacher or admin
const isTeacherOrAdmin = [authenticate, authorize(['teacher', 'admin'])];
const isTeacher = [authenticate, authorize(['teacher'])];

// Get dashboard statistics
router.get('/dashboard-stats/:teacherId?', isTeacherOrAdmin, teacherController.getDashboardStats);

// Get schedule by day
router.get('/schedule/:teacherId?/:day', isTeacherOrAdmin, teacherController.getScheduleByDay);

// Get all students taught by a teacher
router.get('/students/:teacherId?', isTeacherOrAdmin, teacherController.getStudents);

// Get all courses taught by a teacher
router.get('/courses/:teacherId?', isTeacherOrAdmin, teacherController.getCourses);

export default router; 