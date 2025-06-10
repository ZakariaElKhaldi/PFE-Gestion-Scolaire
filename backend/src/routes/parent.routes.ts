import { Router, Request, Response, RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { pool } from '../config/db';

const router = Router();

// Apply authentication middleware
router.use(authenticate);

// Get progress data for the parent's children
const getProgressHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user information' });
      return;
    }

    const parentId = req.user.userId;
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
        SELECT c.title AS subject, g.value AS grade, g.type AS gradeType
        FROM grades g
        JOIN courses c ON g.courseId = c.id
        WHERE g.studentId = ?
      `, [child.childId]);

      console.log(`Performance data for child ${child.childId}:`, performanceData);

      // Fetch skills data avec la bonne structure de colonne
      let skillsData: any[] = [];
      try {
        const [skills] = await pool.query<any[]>(`
          SELECT skillName as skill, progress as score
          FROM skills
          WHERE studentId = ?
        `, [child.childId]);
        skillsData = skills;
        console.log(`Skills data for child ${child.childId}:`, skillsData);
      } catch (error: any) {
        console.log(`Skills data not available: ${error.message}`);
      }

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
