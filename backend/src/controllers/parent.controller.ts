import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/error.middleware';
import { sendSuccess, sendBadRequest, sendNotFound } from '../utils/response.utils';
import { ParentModel } from '../models/parent.model';

// Fonction helper pour les erreurs serveur
const sendServerError = (res: Response, message: string = 'Internal Server Error') => {
  return res.status(500).json({
    success: false,
    message,
    error: 'SERVER_ERROR'
  });
};

// Interface pour typer les compétences
interface ChildSkill {
  skillName: string;
  level: string;
  progress: number;
}

class ParentController {
  /**
   * Get children progress (compatible avec l'ancien format)
   */
  getChildrenProgress = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting children progress for parent: ${parentId}`);
    
    try {
      // Récupérer les enfants
      const children = await ParentModel.getChildren(parentId);
      console.log(`Found ${children.length} children for parent ${parentId}`);

      if (children.length === 0) {
        return res.json({ children: [] });
      }

      // Récupérer les compétences et notes pour chaque enfant
      const [childrenSkills, childrenGrades] = await Promise.all([
        ParentModel.getChildrenSkills(parentId),
        ParentModel.getChildrenGrades(parentId)
      ]);

      // Formater les données pour correspondre au format attendu par le frontend
      const childrenData = children.map(child => {
        const childSkills = childrenSkills[child.id];
        const childGrades = childrenGrades[child.id];

        return {
          childId: child.id,
          name: `${child.firstName} ${child.lastName}`,
          performanceData: childGrades?.grades || [],
          skillsData: childSkills?.skills?.map((skill: ChildSkill) => ({
            skill: skill.skillName,
            score: skill.progress
          })) || []
        };
      });

      console.log('Children progress data formatted successfully');
      console.log('Children data:', childrenData.map(child => ({
        name: child.name,
        skillsCount: child.skillsData.length,
        gradesCount: child.performanceData.length
      })));

      return res.json({ children: childrenData });
    } catch (error) {
      console.error('Error getting children progress:', error);
      return res.status(500).json({ error: 'Failed to fetch progress data' });
    }
  });

  /**
   * Get parent dashboard data
   */
  getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting dashboard data for parent: ${parentId}`);
    
    try {
      const dashboardData = await ParentModel.getDashboardData(parentId);
      console.log('Dashboard data retrieved successfully');
      
      return sendSuccess(res, dashboardData);
    } catch (error) {
      console.error('Error getting parent dashboard data:', error);
      return sendServerError(res, 'Failed to get dashboard data');
    }
  });

  /**
   * Get children
   */
  getChildren = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting children for parent: ${parentId}`);
    
    try {
      const children = await ParentModel.getChildren(parentId);
      console.log(`Found ${children.length} children for parent ${parentId}`);
      
      return sendSuccess(res, { 
        children,
        count: children.length 
      });
    } catch (error) {
      console.error('Error getting children:', error);
      return sendServerError(res, 'Failed to get children');
    }
  });

  /**
   * Get children skills only
   */
  getChildrenSkills = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting children skills for parent: ${parentId}`);
    
    try {
      const childrenSkills = await ParentModel.getChildrenSkills(parentId);
      console.log('Children skills retrieved successfully');
      
      return sendSuccess(res, { 
        skills: childrenSkills,
        summary: {
          totalChildren: Object.keys(childrenSkills).length,
          totalSkills: Object.values(childrenSkills).reduce((total: number, child: any) => 
            total + (child.skills ? child.skills.length : 0), 0)
        }
      });
    } catch (error) {
      console.error('Error getting children skills:', error);
      return sendServerError(res, 'Failed to get children skills');
    }
  });

  /**
   * Get children grades only
   */
  getChildrenGrades = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting children grades for parent: ${parentId}`);
    
    try {
      const childrenGrades = await ParentModel.getChildrenGrades(parentId);
      console.log('Children grades retrieved successfully');
      
      return sendSuccess(res, { 
        grades: childrenGrades,
        summary: {
          totalChildren: Object.keys(childrenGrades).length,
          totalGrades: Object.values(childrenGrades).reduce((total: number, child: any) => 
            total + (child.grades ? child.grades.length : 0), 0)
        }
      });
    } catch (error) {
      console.error('Error getting children grades:', error);
      return sendServerError(res, 'Failed to get children grades');
    }
  });

  /**
   * Get children attendance only
   */
  getChildrenAttendance = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting children attendance for parent: ${parentId}`);
    
    try {
      const childrenAttendance = await ParentModel.getChildrenAttendance(parentId);
      console.log('Children attendance retrieved successfully');
      
      return sendSuccess(res, { 
        attendance: childrenAttendance,
        summary: {
          totalChildren: Object.keys(childrenAttendance).length
        }
      });
    } catch (error) {
      console.error('Error getting children attendance:', error);
      return sendServerError(res, 'Failed to get children attendance');
    }
  });

  /**
   * Get child details
   */
  getChildDetails = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    const { childId } = req.params;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    if (!childId) {
      return sendBadRequest(res, 'Child ID is required');
    }

    console.log(`Getting details for child ${childId} (parent: ${parentId})`);
    
    try {
      const childDetails = await ParentModel.getChildDetails(parentId, childId);
      console.log('Child details retrieved successfully');
      
      return sendSuccess(res, childDetails);
    } catch (error) {
      console.error('Error getting child details:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return sendNotFound(res, 'Child not found');
        }
        if (error.message.includes('does not have access')) {
          return sendBadRequest(res, 'Access denied to this child');
        }
      }
      
      return sendServerError(res, 'Failed to get child details');
    }
  });

  /**
   * Get upcoming events
   */
  getUpcomingEvents = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting upcoming events for parent: ${parentId}`);
    
    try {
      const upcomingEvents = await ParentModel.getUpcomingEvents(parentId);
      console.log(`Found ${upcomingEvents.length} upcoming events`);
      
      return sendSuccess(res, { 
        events: upcomingEvents,
        count: upcomingEvents.length 
      });
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return sendServerError(res, 'Failed to get upcoming events');
    }
  });

  /**
   * Get parent profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    console.log(`Getting profile for parent: ${parentId}`);
    
    try {
      const parent = await ParentModel.findById(parentId);
      
      if (!parent) {
        return sendNotFound(res, 'Parent not found');
      }
      
      console.log('Parent profile retrieved successfully');
      return sendSuccess(res, { parent });
    } catch (error) {
      console.error('Error getting parent profile:', error);
      return sendServerError(res, 'Failed to get parent profile');
    }
  });

  /**
   * Create parent-student relationship
   */
  addChild = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    const { studentId } = req.body;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }

    console.log(`Adding child ${studentId} to parent ${parentId}`);
    
    try {
      const success = await ParentModel.createParentStudentRelation(parentId, studentId);
      
      if (success) {
        console.log('Parent-student relationship created successfully');
        return sendSuccess(res, { message: 'Child added successfully' });
      } else {
        return sendServerError(res, 'Failed to add child');
      }
    } catch (error) {
      console.error('Error adding child:', error);
      return sendServerError(res, 'Failed to add child');
    }
  });

  /**
   * Remove parent-student relationship
   */
  removeChild = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    const { childId } = req.params;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    if (!childId) {
      return sendBadRequest(res, 'Child ID is required');
    }

    console.log(`Removing child ${childId} from parent ${parentId}`);
    
    try {
      const success = await ParentModel.removeParentStudentRelation(parentId, childId);
      
      if (success) {
        console.log('Parent-student relationship removed successfully');
        return sendSuccess(res, { message: 'Child removed successfully' });
      } else {
        return sendNotFound(res, 'Parent-child relationship not found');
      }
    } catch (error) {
      console.error('Error removing child:', error);
      return sendServerError(res, 'Failed to remove child');
    }
  });

  /**
   * Check access to student
   */
  checkAccess = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user?.userId as string;
    const { studentId } = req.params;
    
    if (!parentId) {
      return sendBadRequest(res, 'Parent ID is required');
    }

    if (!studentId) {
      return sendBadRequest(res, 'Student ID is required');
    }

    try {
      const hasAccess = await ParentModel.hasAccessToStudent(parentId, studentId);
      
      return sendSuccess(res, { 
        hasAccess,
        parentId,
        studentId 
      });
    } catch (error) {
      console.error('Error checking access:', error);
      return sendServerError(res, 'Failed to check access');
    }
  });
}

export const parentController = new ParentController();
export default parentController;