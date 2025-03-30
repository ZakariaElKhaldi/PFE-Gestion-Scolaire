import { Request, Response } from 'express';
import { 
  materialModel, 
  CreateMaterialDTO, 
  UpdateMaterialDTO, 
  UpdateMaterialProgressDTO,
  MaterialType,
  MaterialStatus
} from '../models/material.model';
import { 
  sendSuccess, 
  sendCreated, 
  sendNoContent, 
  sendNotFound, 
  sendBadRequest, 
  sendForbidden,
  sendError
} from '../utils/response.utils';
import { asyncHandler } from '../middlewares/error.middleware';
import { upload } from '../controllers/document.controller';
import * as fs from 'fs';
import * as path from 'path';
import { 
  getFileUrl, 
  saveFile, 
  FileInfo, 
  isFileTypeAllowed, 
  isFileSizeAllowed,
  streamFileToResponse
} from '../utils/file-utils';

export class MaterialController {
  /**
   * Get materials for a course
   */
  getMaterialsByCourse = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    
    if (!courseId) {
      return sendBadRequest(res, 'Course ID is required');
    }
    
    const materials = await materialModel.getByCourse(courseId);
    return sendSuccess(res, { materials });
  });

  /**
   * Get materials for a student
   */
  getMaterialsForStudent = asyncHandler(async (req: Request, res: Response) => {
    try {
      const studentId = req.params.studentId || req.user?.studentId || (req.user?.userId as string);
      const courseId = req.query.courseId as string;
      const type = req.query.type as MaterialType;
      const status = req.query.status as MaterialStatus;
      const search = req.query.search as string;
      
      if (!studentId) {
        return sendBadRequest(res, 'Student ID is required');
      }
      
      const materials = await materialModel.getForStudent(studentId, {
        courseId,
        type,
        status,
        search
      });
      
      return sendSuccess(res, { materials });
    } catch (error) {
      console.error('Error in getMaterialsForStudent:', error);
      // Return empty materials array rather than an error to prevent frontend from breaking
      return sendSuccess(res, { materials: [] });
    }
  });

  /**
   * Get a specific material
   */
  getMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { materialId } = req.params;
    const studentId = req.user?.studentId || (req.user?.userId as string);
    
    if (!materialId) {
      return sendBadRequest(res, 'Material ID is required');
    }
    
    const material = await materialModel.findById(materialId);
    
    if (!material) {
      return sendNotFound(res, 'Material not found');
    }
    
    // If student is accessing, update the last accessed time
    if (req.user?.role === 'student') {
      await materialModel.updateProgress(materialId, studentId, {});
    }
    
    return sendSuccess(res, material);
  });

  /**
   * Create a new material
   */
  createMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { 
      courseId,
      title,
      type,
      format,
      description,
      dueDate,
      duration
    } = req.body;
    
    const uploadedBy = req.user?.userId as string;
    
    if (!courseId || !title || !type || !format) {
      return sendBadRequest(res, 'Missing required fields');
    }
    
    if (!uploadedBy) {
      return sendBadRequest(res, 'User ID is required');
    }
    
    // Handle file upload if present
    let fileUrl: string | undefined;
    let fileSize: number | undefined;
    
    if (req.file) {
      try {
        const fileInfo: FileInfo = await saveFile(
          req.file.buffer, 
          req.file.originalname,
          'document'
        );
        fileUrl = getFileUrl(fileInfo.fileName);
        fileSize = fileInfo.size;
      } catch (error: any) {
        return sendError(res, error.message || 'File upload failed', 400);
      }
    }
    
    const materialData: CreateMaterialDTO = {
      courseId,
      title,
      type,
      format,
      description,
      uploadedBy,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      fileUrl,
      fileSize,
      duration: duration ? parseInt(duration) : undefined
    };
    
    const materialId = await materialModel.create(materialData);
    
    return sendCreated(res, { 
      materialId,
      message: 'Material created successfully'
    });
  });

  /**
   * Update a material
   */
  updateMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { materialId } = req.params;
    const { 
      title, 
      type, 
      format, 
      description, 
      dueDate,
      duration
    } = req.body;
    
    if (!materialId) {
      return sendBadRequest(res, 'Material ID is required');
    }
    
    const material = await materialModel.findById(materialId);
    
    if (!material) {
      return sendNotFound(res, 'Material not found');
    }
    
    // Check if user has permission to update (teacher or admin)
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return sendForbidden(res, 'You do not have permission to update this material');
    }
    
    // Handle file upload if present
    let fileUrl: string | undefined;
    let fileSize: number | undefined;
    
    if (req.file) {
      try {
        // Delete old file if exists
        if (material.fileUrl) {
          const oldFilename = material.fileUrl.split('/').pop();
          if (oldFilename) {
            const oldFilePath = path.join(__dirname, '../../uploads/materials', oldFilename);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          }
        }
        
        const fileInfo: FileInfo = await saveFile(
          req.file.buffer,
          req.file.originalname,
          'document'
        );
        fileUrl = getFileUrl(fileInfo.fileName);
        fileSize = fileInfo.size;
      } catch (error: any) {
        return sendError(res, error.message || 'File upload failed', 400);
      }
    }
    
    const materialData: UpdateMaterialDTO = {
      title,
      type,
      format,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      fileUrl,
      fileSize,
      duration: duration ? parseInt(duration) : undefined
    };
    
    const updated = await materialModel.update(materialId, materialData);
    
    if (!updated) {
      return sendError(res, 'Failed to update material', 500);
    }
    
    return sendSuccess(res, { message: 'Material updated successfully' });
  });

  /**
   * Delete a material
   */
  deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { materialId } = req.params;
    
    if (!materialId) {
      return sendBadRequest(res, 'Material ID is required');
    }
    
    const material = await materialModel.findById(materialId);
    
    if (!material) {
      return sendNotFound(res, 'Material not found');
    }
    
    // Check if user has permission to delete (teacher or admin)
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return sendForbidden(res, 'You do not have permission to delete this material');
    }
    
    // Delete file if exists
    if (material.fileUrl) {
      const filename = material.fileUrl.split('/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '../../uploads/materials', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    const deleted = await materialModel.delete(materialId);
    
    if (!deleted) {
      return sendError(res, 'Failed to delete material', 500);
    }
    
    return sendNoContent(res);
  });

  /**
   * Download a material
   */
  downloadMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { materialId } = req.params;
    const studentId = req.user?.studentId || (req.user?.userId as string);
    
    if (!materialId) {
      return sendBadRequest(res, 'Material ID is required');
    }
    
    const material = await materialModel.findById(materialId);
    
    if (!material) {
      return sendNotFound(res, 'Material not found');
    }
    
    if (!material.fileUrl) {
      return sendBadRequest(res, 'No file available for this material');
    }
    
    // If student is downloading, update the progress
    if (req.user?.role === 'student') {
      await materialModel.updateProgress(materialId, studentId, {
        status: 'in_progress',
        progress: 50 // Assuming 50% progress when downloading
      });
    }
    
    const filename = material.fileUrl.split('/').pop();
    if (!filename) {
      return sendError(res, 'File not found', 404);
    }
    
    const filePath = path.join(__dirname, '../../uploads/materials', filename);
    
    if (!fs.existsSync(filePath)) {
      return sendError(res, 'File not found', 404);
    }
    
    // Stream the file to the response
    return streamFileToResponse(filePath, res, material.title);
  });

  /**
   * Update material progress
   */
  updateMaterialProgress = asyncHandler(async (req: Request, res: Response) => {
    const { materialId } = req.params;
    const studentId = req.user?.studentId || (req.user?.userId as string);
    const { status, progress } = req.body;
    
    if (!materialId) {
      return sendBadRequest(res, 'Material ID is required');
    }
    
    if (req.user?.role !== 'student') {
      return sendForbidden(res, 'Only students can update material progress');
    }
    
    const material = await materialModel.findById(materialId);
    
    if (!material) {
      return sendNotFound(res, 'Material not found');
    }
    
    const progressData: UpdateMaterialProgressDTO = {
      status,
      progress
    };
    
    const updated = await materialModel.updateProgress(materialId, studentId, progressData);
    
    if (!updated) {
      return sendError(res, 'Failed to update progress', 500);
    }
    
    return sendSuccess(res, { message: 'Progress updated successfully' });
  });

  /**
   * Get course progress summary
   */
  getCourseProgressSummary = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const studentId = req.params.studentId || (req.user?.userId as string);
    
    if (!courseId) {
      return sendBadRequest(res, 'Course ID is required');
    }
    
    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }
    
    const summary = await materialModel.getCourseProgressSummary(courseId, studentId);
    return sendSuccess(res, summary);
  });
}

export const materialController = new MaterialController(); 