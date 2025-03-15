import { Router, Request, Response, RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { pool } from '../config/db';
import { JwtPayload } from '../types/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticate);

// Get progress data for the parent's children
const getProgressHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    // Ensure req.user is defined and contains userId
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user information' });
      return;
    }

    const parentId = req.user.userId; // Extract parent ID from req.user
    console.log('Parent ID:', parentId);

    // Fetch children of the parent
    const [children] = await pool.query<any[]>(`
      SELECT u.id AS childId, u.firstName, u.lastName
      FROM parent_child pc
      JOIN users u ON pc.studentId = u.id
      WHERE pc.parentId = ?
    `, [parentId]);

    console.log('Children:', children);

    if (Array.isArray(children) && children.length === 0) {
      res.json({ children: [] });
      return;
    }

    // Fetch academic performance and skills data for each child
    const childrenData = await Promise.all(children.map(async (child: any) => {
      const [performanceData] = await pool.query(`
        SELECT c.name AS subject, g.value AS grade, g.type AS gradeType
        FROM grades g
        JOIN courses c ON g.courseId = c.id
        WHERE g.studentId = ?
      `, [child.childId]);

      console.log(`Performance data for child ${child.childId}:`, performanceData);

      // Try to fetch skills data, but handle the case where the table doesn't exist
      let skillsData: any[] = [];
      try {
        const [skills] = await pool.query<any[]>(`
          SELECT skill, score
          FROM skills
          WHERE studentId = ?
        `, [child.childId]);
        skillsData = skills;
      } catch (error: any) {
        console.log(`Skills data not available: ${error.message}`);
        // Return empty skills array if table doesn't exist
      }

      console.log(`Skills data for child ${child.childId}:`, skillsData);

      return {
        childId: child.childId,
        name: `${child.firstName} ${child.lastName}`,
        performanceData,
        skillsData,
      };
    }));

    res.json({ children: childrenData });
  } catch (error) {
    console.error('Error fetching parent progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
};

router.get('/progress', getProgressHandler);

export default router;