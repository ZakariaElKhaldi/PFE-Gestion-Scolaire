import { Request, Response } from 'express';
import { departmentModel } from '../models/department.model';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

class DepartmentController {
  /**
   * Get all departments
   */
  async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await departmentModel.findAll();
      
      res.status(200).json({
        error: false,
        data: { departments }
      });
    } catch (error) {
      logger.error('Error getting all departments:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve departments'
      });
    }
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const department = await departmentModel.findById(id);
      
      if (!department) {
        throw ApiError.notFound('Department not found');
      }
      
      res.status(200).json({
        error: false,
        data: { department }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error getting department by ID:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to retrieve department'
        });
      }
    }
  }

  /**
   * Create new department
   */
  async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        throw ApiError.badRequest('Department name is required');
      }
      
      const department = await departmentModel.create({
        name,
        description
      });
      
      if (!department) {
        throw ApiError.internal('Failed to create department');
      }
      
      res.status(201).json({
        error: false,
        message: 'Department created successfully',
        data: { department }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error creating department:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to create department'
        });
      }
    }
  }

  /**
   * Update department
   */
  async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      // Check if department exists
      const existingDepartment = await departmentModel.findById(id);
      if (!existingDepartment) {
        throw ApiError.notFound('Department not found');
      }
      
      // Update department
      const updatedDepartment = await departmentModel.update(id, {
        name,
        description
      });
      
      if (!updatedDepartment) {
        throw ApiError.internal('Failed to update department');
      }
      
      res.status(200).json({
        error: false,
        message: 'Department updated successfully',
        data: { department: updatedDepartment }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error updating department:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to update department'
        });
      }
    }
  }

  /**
   * Delete department
   */
  async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if department exists
      const existingDepartment = await departmentModel.findById(id);
      if (!existingDepartment) {
        throw ApiError.notFound('Department not found');
      }
      
      // Delete department
      const deleted = await departmentModel.delete(id);
      
      if (!deleted) {
        throw ApiError.internal('Failed to delete department');
      }
      
      res.status(200).json({
        error: false,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error deleting department:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to delete department'
        });
      }
    }
  }
}

export const departmentController = new DepartmentController(); 