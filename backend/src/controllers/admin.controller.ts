import { Request, Response } from 'express';
import { userService, UserFilters } from '../services/user.service';
import { courseService } from '../services/course.service';
import { classService } from '../services/class.service';
import { departmentService } from '../services/department.service';

// Define interfaces for better type safety
interface Student {
  id: string;
  grade?: string;
  status?: string;
  createdAt: string;
}

interface Teacher {
  id: string;
  department?: { name: string };
  employmentType?: string;
  status?: string;
  createdAt: string;
}

interface Parent {
  id: string;
  children?: any[];
  status?: string;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  description: string;
  category?: string;
  paymentDate?: string;
  createdAt: string;
  status: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

// Mock payment service for now
const paymentService = {
  getPayments: async (options: any = {}) => {
    return [
      {
        id: '1',
        amount: 1000,
        description: 'Tuition fee',
        category: 'Tuition',
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        amount: 500,
        description: 'Library fee',
        category: 'Fees',
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
    ];
  }
};

// Mock student service for now
const studentService = {
  getStudents: async (options: any = {}) => {
    return [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        grade: '10',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        grade: '11',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
  }
};

// Mock teacher service for now
const teacherService = {
  getTeachers: async (options: any = {}) => {
    return [
      {
        id: '1',
        firstName: 'Robert',
        lastName: 'Johnson',
        department: { name: 'Mathematics' },
        employmentType: 'full-time',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Williams',
        department: { name: 'Science' },
        employmentType: 'part-time',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
  }
};

class AdminController {
  /**
   * Get dashboard data for admin home page
   */
  async getDashboardData(req: Request, res: Response) {
    try {
      // Get counts from various services
      const [
        students,
        teachers,
        classes,
        parents,
        recentPayments,
        recentRegistrations
      ] = await Promise.all([
        studentService.getStudents({}),
        teacherService.getTeachers({}),
        classService.getClasses({}),
        userService.getUsers({ role: 'parent' }),
        paymentService.getPayments({ limit: 5 }),
        userService.getUsers({ role: 'student' })
      ]);

      // Calculate change percentages (mock data for now)
      // In a real implementation, you would compare with previous period
      const studentChange = 8.5;
      const teacherChange = 3.2;
      const parentChange = 5.7;

      // Format recent activities
      const recentActivities = [
        ...recentRegistrations.map((user: User) => ({
          id: user.id,
          type: 'registration',
          title: 'New User Registration',
          description: `${user.firstName} ${user.lastName} registered as ${user.role}`,
          timestamp: user.createdAt
        })),
        ...recentPayments.map((payment: Payment) => ({
          id: payment.id,
          type: 'payment',
          title: 'Payment Received',
          description: `Payment of $${payment.amount} received for ${payment.description}`,
          timestamp: payment.createdAt || new Date().toISOString()
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 8);

      res.status(200).json({
        error: false,
        data: {
          stats: {
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalClasses: classes.length,
            totalParents: parents.length,
            studentChange,
            teacherChange,
            parentChange
          },
          recentActivities
        },
        message: 'Dashboard data retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve dashboard data'
      });
    }
  }

  /**
   * Get detailed user statistics
   */
  async getUserStats(req: Request, res: Response) {
    try {
      const [students, teachers, parents] = await Promise.all([
        studentService.getStudents({}),
        teacherService.getTeachers({}),
        userService.getUsers({ role: 'parent' })
      ]);

      // Get students by grade
      const studentsByGrade = students.reduce((acc: Record<string, number>, student: Student) => {
        const grade = student.grade || 'Unassigned';
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {});

      // Get teachers by department
      const teachersByDepartment = teachers.reduce((acc: Record<string, number>, teacher: Teacher) => {
        const department = teacher.department?.name || 'Unassigned';
        acc[department] = (acc[department] || 0) + 1;
        return acc;
      }, {});

      // Count parents with multiple children
      const parentsWithMultipleChildren = parents.filter((parent: Parent) => 
        parent.children && parent.children.length > 1
      ).length;

      res.status(200).json({
        error: false,
        data: {
          students: {
            total: students.length,
            active: students.filter((s: Student) => s.status === 'active').length,
            newThisMonth: students.filter((s: Student) => {
              const createdAt = new Date(s.createdAt);
              const now = new Date();
              return createdAt.getMonth() === now.getMonth() && 
                     createdAt.getFullYear() === now.getFullYear();
            }).length,
            byGrade: studentsByGrade
          },
          teachers: {
            total: teachers.length,
            fullTime: teachers.filter((t: Teacher) => t.employmentType === 'full-time').length,
            partTime: teachers.filter((t: Teacher) => t.employmentType === 'part-time').length,
            byDepartment: teachersByDepartment
          },
          parents: {
            total: parents.length,
            active: parents.filter((p: Parent) => p.status === 'active').length,
            withMultipleChildren: parentsWithMultipleChildren
          }
        },
        message: 'User statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error fetching user statistics:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve user statistics'
      });
    }
  }

  /**
   * Get system health statistics
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      // In a real implementation, you would get actual system metrics
      // For now, we'll return mock data
      res.status(200).json({
        error: false,
        data: {
          uptime: '99.98%',
          storage: {
            total: '2TB',
            used: '1.2TB',
            available: '0.8TB'
          },
          performance: {
            responseTime: '245ms',
            activeUsers: 324,
            peakHours: ['09:00-10:00', '13:00-14:00']
          },
          lastBackup: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          systemVersion: 'v2.5.1'
        },
        message: 'System statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error fetching system statistics:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve system statistics'
      });
    }
  }

  /**
   * Get financial overview data
   */
  async getFinancialOverview(req: Request, res: Response) {
    try {
      const payments = await paymentService.getPayments({});
      
      // Calculate total revenue
      const totalRevenue = payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
      
      // Group payments by category
      const revenueByCategory = payments.reduce((acc: Record<string, number>, payment: Payment) => {
        const category = payment.category || 'Other';
        acc[category] = (acc[category] || 0) + payment.amount;
        return acc;
      }, {});
      
      // Group payments by month
      const revenueByMonth = payments.reduce((acc: Record<string, number>, payment: Payment) => {
        const date = new Date(payment.paymentDate || payment.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthYear] = (acc[monthYear] || 0) + payment.amount;
        return acc;
      }, {});
      
      res.status(200).json({
        error: false,
        data: {
          totalRevenue,
          revenueByCategory,
          revenueByMonth,
          recentTransactions: payments.slice(0, 10).map((p: Payment) => ({
            id: p.id,
            date: p.paymentDate || p.createdAt,
            description: p.description,
            category: p.category || 'Other',
            amount: p.amount,
            status: p.status
          }))
        },
        message: 'Financial overview retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error fetching financial overview:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve financial overview'
      });
    }
  }
}

export const adminController = new AdminController(); 