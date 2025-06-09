import { Router } from 'express';
import { departmentController } from '../controllers/department.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { UserRole } from '../types/auth';

const router = Router();

// Public routes - allow anyone to view departments
router.get('/', asyncHandler(departmentController.getAllDepartments.bind(departmentController)));
router.get('/:id', asyncHandler(departmentController.getDepartmentById.bind(departmentController)));

// Protected routes - require admin authentication
router.use(authenticate);
router.use(authorize([UserRole.ADMINISTRATOR]));

router.post('/', asyncHandler(departmentController.createDepartment.bind(departmentController)));
router.put('/:id', asyncHandler(departmentController.updateDepartment.bind(departmentController)));
router.delete('/:id', asyncHandler(departmentController.deleteDepartment.bind(departmentController)));

export default router; 