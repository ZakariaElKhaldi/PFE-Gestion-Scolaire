import { Request, Response } from 'express';
import { attendanceModel } from '../models/attendance.model';
import { StudentModel } from '../models/student.model';
import { userModel } from '../models/user.model';
import { classModel } from '../models/class.model';
import { courseModel } from '../models/course.model';
import { paymentModel } from '../models/payment.model';
import { DocumentModel } from '../models/document.model';
import { feedbackModel } from '../models/feedback.model';

/**
 * Controller for parent-related operations
 */
export const parentController = {
  /**
   * Get all children of a parent
   */
  async getChildren(req: Request, res: Response) {
    console.log('[PARENT-CONTROLLER] getChildren - Processing request');
    try {
      const parentId = req.user?.id;
      console.log('[PARENT-CONTROLLER] getChildren - Parent ID:', parentId);
      
      if (!parentId) {
        console.log('[PARENT-CONTROLLER] getChildren - Authentication error: No parent ID');
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would fetch children from the database
      // For now, we'll return mock data
      // const children = await StudentModel.findByParentId(parentId);
      
      const mockChildren = [
        {
          id: '1',
          firstName: 'Emma',
          lastName: 'Johnson',
          grade: 'Grade 10',
          profileImage: 'https://i.pravatar.cc/150?img=32'
        },
        {
          id: '2',
          firstName: 'Noah',
          lastName: 'Johnson',
          grade: 'Grade 8',
          profileImage: 'https://i.pravatar.cc/150?img=51'
        }
      ];
      
      console.log(`[PARENT-CONTROLLER] getChildren - Returning ${mockChildren.length} children`);
      return res.status(200).json({
        error: false,
        data: mockChildren.map(child => ({
          id: child.id,
          name: `${child.firstName} ${child.lastName}`,
          grade: child.grade,
          profileImage: child.profileImage
        })),
        message: 'Children retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting children:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve children'
      });
    }
  },
  
  /**
   * Get attendance records for all children of a parent
   */
  async getChildrenAttendance(req: Request, res: Response) {
    try {
      const parentId = req.user?.id;
      const { startDate, endDate, courseId, status } = req.query;
      
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would:
      // 1. Get all children of the parent
      // 2. Get attendance records for each child
      // For now, we'll return mock data
      // const children = await StudentModel.findByParentId(parentId);
      // const childrenIds = children.map(child => child.id);
      // const attendanceRecords = await attendanceModel.findByStudentIds(childrenIds, {
      //   startDate, endDate, courseId, status
      // });
      
      const mockAttendanceRecords = [
        {
          id: 'a1',
          studentId: '1',
          studentName: 'Emma Johnson',
          date: '2023-03-01',
          courseId: 'c1',
          courseName: 'Mathematics 101',
          status: 'present',
          timeIn: '09:00',
          timeOut: '10:30',
          notes: 'Active participation in class'
        },
        {
          id: 'a2',
          studentId: '1',
          studentName: 'Emma Johnson',
          date: '2023-03-02',
          courseId: 'c2',
          courseName: 'Physics 201',
          status: 'late',
          timeIn: '10:15',
          timeOut: '11:45',
          notes: 'Arrived 15 minutes late'
        },
        {
          id: 'a3',
          studentId: '2',
          studentName: 'Noah Johnson',
          date: '2023-03-01',
          courseId: 'c1',
          courseName: 'Mathematics 101',
          status: 'present',
          timeIn: '09:00',
          timeOut: '10:30'
        },
        {
          id: 'a4',
          studentId: '2',
          studentName: 'Noah Johnson',
          date: '2023-03-02',
          courseId: 'c2',
          courseName: 'Physics 201',
          status: 'absent',
          notes: 'Medical appointment'
        }
      ];
      
      // Filter mock records based on query params
      let filteredRecords = [...mockAttendanceRecords];
      
      if (startDate) {
        filteredRecords = filteredRecords.filter(record => 
          new Date(record.date) >= new Date(startDate as string)
        );
      }
      
      if (endDate) {
        filteredRecords = filteredRecords.filter(record => 
          new Date(record.date) <= new Date(endDate as string)
        );
      }
      
      if (courseId) {
        filteredRecords = filteredRecords.filter(record => 
          record.courseId === courseId
        );
      }
      
      if (status) {
        filteredRecords = filteredRecords.filter(record => 
          record.status === status
        );
      }
      
      return res.status(200).json({
        error: false,
        data: filteredRecords,
        message: 'Attendance records retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting children attendance:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve attendance records'
      });
    }
  },
  
  /**
   * Get attendance records for a specific child
   */
  async getChildAttendance(req: Request, res: Response) {
    try {
      const parentId = req.user?.id;
      const { childId } = req.params;
      const { startDate, endDate, courseId, status } = req.query;
      
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would:
      // 1. Verify that the child belongs to the parent
      // 2. Get attendance records for the child
      // For now, we'll return mock data
      // const child = await StudentModel.findById(childId);
      // if (!child || child.parentId !== parentId) {
      //   return res.status(403).json({
      //     error: true,
      //     message: 'You are not authorized to view this child\'s attendance'
      //   });
      // }
      // const attendanceRecords = await attendanceModel.getByStudentId(childId, {
      //   startDate, endDate, courseId, status
      // });
      
      const mockAttendanceRecords = [
        {
          id: 'a1',
          studentId: '1',
          studentName: 'Emma Johnson',
          date: '2023-03-01',
          courseId: 'c1',
          courseName: 'Mathematics 101',
          status: 'present',
          timeIn: '09:00',
          timeOut: '10:30',
          notes: 'Active participation in class'
        },
        {
          id: 'a2',
          studentId: '1',
          studentName: 'Emma Johnson',
          date: '2023-03-02',
          courseId: 'c2',
          courseName: 'Physics 201',
          status: 'late',
          timeIn: '10:15',
          timeOut: '11:45',
          notes: 'Arrived 15 minutes late'
        },
        {
          id: 'a3',
          studentId: '2',
          studentName: 'Noah Johnson',
          date: '2023-03-01',
          courseId: 'c1',
          courseName: 'Mathematics 101',
          status: 'present',
          timeIn: '09:00',
          timeOut: '10:30'
        },
        {
          id: 'a4',
          studentId: '2',
          studentName: 'Noah Johnson',
          date: '2023-03-02',
          courseId: 'c2',
          courseName: 'Physics 201',
          status: 'absent',
          notes: 'Medical appointment'
        }
      ];
      
      // Filter records for the specific child
      let childRecords = mockAttendanceRecords.filter(record => 
        record.studentId === childId
      );
      
      // Apply additional filters
      if (startDate) {
        childRecords = childRecords.filter(record => 
          new Date(record.date) >= new Date(startDate as string)
        );
      }
      
      if (endDate) {
        childRecords = childRecords.filter(record => 
          new Date(record.date) <= new Date(endDate as string)
        );
      }
      
      if (courseId) {
        childRecords = childRecords.filter(record => 
          record.courseId === courseId
        );
      }
      
      if (status) {
        childRecords = childRecords.filter(record => 
          record.status === status
        );
      }
      
      return res.status(200).json({
        error: false,
        data: childRecords,
        message: 'Child attendance records retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting child attendance:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve attendance records'
      });
    }
  },
  
  /**
   * Get attendance statistics for all children of a parent
   */
  async getChildrenAttendanceStats(req: Request, res: Response) {
    try {
      const parentId = req.user?.id;
      
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would:
      // 1. Get all children of the parent
      // 2. Calculate attendance statistics for each child
      // For now, we'll return mock data
      // const children = await StudentModel.findByParentId(parentId);
      // const stats = await Promise.all(
      //   children.map(async (child) => {
      //     const attendance = await attendanceModel.getAttendanceStats(child.id);
      //     return {
      //       childId: child.id,
      //       childName: `${child.firstName} ${child.lastName}`,
      //       stats: attendance
      //     };
      //   })
      // );
      
      const mockStats = [
        {
          childId: '1',
          childName: 'Emma Johnson',
          stats: {
            totalClasses: 50,
            presentCount: 42,
            absentCount: 3,
            lateCount: 5,
            excusedCount: 0,
            attendanceRate: 84
          }
        },
        {
          childId: '2',
          childName: 'Noah Johnson',
          stats: {
            totalClasses: 48,
            presentCount: 40,
            absentCount: 4,
            lateCount: 2,
            excusedCount: 2,
            attendanceRate: 83
          }
        }
      ];
      
      return res.status(200).json({
        error: false,
        data: mockStats,
        message: 'Attendance statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting children attendance statistics:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve attendance statistics'
      });
    }
  },
  
  /**
   * Get payment information for all children of a parent
   */
  async getPayments(req: Request, res: Response) {
    console.log('[PARENT-CONTROLLER] getPayments - Processing request');
    try {
      const parentId = req.user?.id;
      console.log('[PARENT-CONTROLLER] getPayments - Parent ID:', parentId);
      
      // Parse query parameters
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const status = req.query.status as string;
      const childId = req.query.childId as string;
      
      console.log('[PARENT-CONTROLLER] getPayments - Query parameters:', { 
        startDate, endDate, status, childId 
      });
      
      if (!parentId) {
        console.log('[PARENT-CONTROLLER] getPayments - Authentication error: No parent ID');
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would fetch payments from the database
      // with filtering based on the query parameters
      // const payments = await paymentModel.findByParentId(parentId, { startDate, endDate, status, childId });
      
      // For now, we'll return mock data
      const mockPayments = [
        {
          id: "p1",
          studentId: "1",
          studentName: "Emma Johnson",
          description: "School Fees - Term 1",
          amount: 500,
          dueDate: "2023-03-15",
          status: "paid",
          transactionId: "tx-12345",
          paymentDate: "2023-03-10",
          paymentMethod: "credit_card",
          invoiceUrl: "/invoices/p1.pdf"
        },
        {
          id: "p2",
          studentId: "1",
          studentName: "Emma Johnson",
          description: "Field Trip Fee",
          amount: 50,
          dueDate: "2023-04-10",
          status: "pending",
          invoiceUrl: "/invoices/p2.pdf"
        },
        {
          id: "p3",
          studentId: "2",
          studentName: "Noah Johnson",
          description: "School Fees - Term 1",
          amount: 450,
          dueDate: "2023-03-15",
          status: "paid",
          transactionId: "tx-12346",
          paymentDate: "2023-03-12",
          paymentMethod: "bank_transfer",
          invoiceUrl: "/invoices/p3.pdf"
        }
      ];
      
      // Apply filters from query parameters
      let filteredPayments = [...mockPayments];
      
      if (startDate) {
        filteredPayments = filteredPayments.filter(p => new Date(p.dueDate) >= new Date(startDate));
      }
      
      if (endDate) {
        filteredPayments = filteredPayments.filter(p => new Date(p.dueDate) <= new Date(endDate));
      }
      
      if (status) {
        filteredPayments = filteredPayments.filter(p => p.status === status);
      }
      
      if (childId) {
        filteredPayments = filteredPayments.filter(p => p.studentId === childId);
      }
      
      console.log(`[PARENT-CONTROLLER] getPayments - Returning ${filteredPayments.length} payments`);
      return res.status(200).json({
        error: false,
        data: filteredPayments,
        message: 'Payments retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting payments:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve payments'
      });
    }
  },
  
  /**
   * Make a payment for a specific payment
   */
  async makePayment(req: Request, res: Response) {
    try {
      const parentId = req.user?.id;
      const { paymentId } = req.params;
      const { amount, paymentMethod } = req.body;
      
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      if (!paymentId || !amount || !paymentMethod) {
        return res.status(400).json({
          error: true,
          message: 'Missing required fields: paymentId, amount, paymentMethod'
        });
      }
      
      // In a real application, you would verify the payment exists and belongs to one of the parent's children
      // Then process the payment
      // For now, we'll simulate a successful payment
      const transactionId = `tx-${Math.floor(Math.random() * 100000)}`;
      const paymentDate = new Date().toISOString();
      
      return res.status(200).json({
        error: false,
        data: {
          success: true,
          transactionId,
          paymentDate,
          message: 'Payment processed successfully'
        },
        message: 'Payment processed successfully'
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to process payment'
      });
    }
  },
  
  /**
   * Get documents for a parent's children
   */
  async getDocuments(req: Request, res: Response) {
    console.log('[PARENT-CONTROLLER] getDocuments - Processing request');
    try {
      const parentId = req.user?.id;
      console.log('[PARENT-CONTROLLER] getDocuments - Parent ID:', parentId);
      
      // Parse query parameters
      const childId = req.query.childId as string;
      const type = req.query.type as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      console.log('[PARENT-CONTROLLER] getDocuments - Query parameters:', { 
        childId, type, startDate, endDate 
      });
      
      if (!parentId) {
        console.log('[PARENT-CONTROLLER] getDocuments - Authentication error: No parent ID');
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would fetch documents from the database
      // filtered by the query parameters
      // const documents = await DocumentModel.findByParentId(parentId, { childId, type, startDate, endDate });
      
      // For now, we'll return mock data
      const mockDocuments = [
        {
          id: "d1",
          childId: "1",
          childName: "Emma Johnson",
          title: "Term 1 Report Card",
          type: "report_card",
          uploadDate: "2023-03-20",
          size: 1240000, // in bytes
          fileUrl: "/documents/report_cards/emma_term1.pdf",
          isNew: true
        },
        {
          id: "d2",
          childId: "1",
          childName: "Emma Johnson",
          title: "Science Museum Field Trip Permission",
          type: "permission_slip",
          uploadDate: "2023-03-10",
          size: 540000,
          fileUrl: "/documents/permission_slips/science_museum.pdf",
          requiresSignature: true,
          signatureStatus: "pending"
        },
        {
          id: "d3",
          childId: "2",
          childName: "Noah Johnson",
          title: "Term 1 Report Card",
          type: "report_card",
          uploadDate: "2023-03-20",
          size: 1180000,
          fileUrl: "/documents/report_cards/noah_term1.pdf",
          isNew: true
        },
        {
          id: "d4",
          title: "School Newsletter - March 2023",
          type: "newsletter",
          uploadDate: "2023-03-01",
          size: 2540000,
          fileUrl: "/documents/newsletters/march_2023.pdf"
        }
      ];
      
      // Apply filters from query parameters
      let filteredDocuments = [...mockDocuments];
      
      if (childId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.childId === childId);
      }
      
      if (type) {
        filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
      }
      
      if (startDate) {
        filteredDocuments = filteredDocuments.filter(doc => 
          new Date(doc.uploadDate) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filteredDocuments = filteredDocuments.filter(doc => 
          new Date(doc.uploadDate) <= new Date(endDate)
        );
      }
      
      console.log(`[PARENT-CONTROLLER] getDocuments - Returning ${filteredDocuments.length} documents`);
      return res.status(200).json({
        error: false,
        data: filteredDocuments,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting documents:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve documents'
      });
    }
  },
  
  /**
   * Download a document
   */
  async downloadDocument(req: Request, res: Response) {
    try {
      const parentId = req.user?.id;
      const { documentId } = req.params;
      
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would verify the document exists and the parent has access to it
      // Then return the file
      // For now, we'll return a mock response
      
      // Since we can't actually send a file in this mock response,
      // we'll just return a success message
      return res.status(200).json({
        error: false,
        message: 'Document download initiated'
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to download document'
      });
    }
  },
  
  /**
   * Sign a document
   */
  async signDocument(req: Request, res: Response) {
    try {
      const parentId = req.user?.id;
      const { documentId } = req.params;
      const { signatureData, signatureDate } = req.body;
      
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      if (!documentId || !signatureData) {
        return res.status(400).json({
          error: true,
          message: 'Missing required fields: documentId, signatureData'
        });
      }
      
      // In a real application, you would verify the document exists and the parent has access to it
      // Then process the signature
      // For now, we'll simulate a successful signature
      const signatureId = `sig-${Math.floor(Math.random() * 100000)}`;
      
      return res.status(200).json({
        error: false,
        data: {
          success: true,
          signatureId,
          message: 'Document signed successfully'
        },
        message: 'Document signed successfully'
      });
    } catch (error) {
      console.error('Error signing document:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to sign document'
      });
    }
  },
  
  /**
   * Get feedback messages for children of the parent
   */
  async getFeedback(req: Request, res: Response) {
    console.log('[PARENT-CONTROLLER] getFeedback - Processing request');
    try {
      const parentId = req.user?.id;
      console.log('[PARENT-CONTROLLER] getFeedback - Parent ID:', parentId);
      
      // Parse query parameters
      const childId = req.query.childId as string;
      const category = req.query.category as string;
      const isRead = req.query.isRead as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      console.log('[PARENT-CONTROLLER] getFeedback - Query parameters:', { 
        childId, category, isRead, startDate, endDate 
      });
      
      if (!parentId) {
        console.log('[PARENT-CONTROLLER] getFeedback - Authentication error: No parent ID');
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      // In a real application, you would fetch feedback from the database
      // filtered by the query parameters
      // const feedback = await feedbackModel.findByParentId(parentId, { childId, category, isRead, startDate, endDate });
      
      // For now, we'll return mock data
      const mockFeedback = [
        {
          id: "f1",
          childId: "1",
          childName: "Emma Johnson",
          teacherId: "t1",
          teacherName: "Mr. Anderson",
          subject: "Mathematics Performance",
          message: "Emma has shown great improvement in her calculus skills this month. Keep encouraging her practice at home.",
          date: "2023-03-18",
          isRead: false,
          category: "academic",
          priority: "medium"
        },
        {
          id: "f2",
          childId: "1",
          childName: "Emma Johnson",
          teacherId: "t2",
          teacherName: "Ms. Thompson",
          subject: "Late Arrival Notice",
          message: "Emma was 15 minutes late to class today. Please ensure she arrives on time for morning classes.",
          date: "2023-03-15",
          isRead: true,
          category: "attendance",
          priority: "high",
          responseRequired: true
        },
        {
          id: "f3",
          childId: "2",
          childName: "Noah Johnson",
          teacherId: "t3",
          teacherName: "Mr. Roberts",
          subject: "History Project Excellence",
          message: "Noah's history project on Ancient Egypt was exceptional. He demonstrated great research skills and creativity.",
          date: "2023-03-10",
          isRead: true,
          category: "academic",
          priority: "medium"
        },
        {
          id: "f4",
          childId: "2",
          childName: "Noah Johnson",
          teacherId: "t1",
          teacherName: "Mr. Anderson",
          subject: "Missing Math Homework",
          message: "Noah has not submitted his math homework for the past two assignments. Please help ensure he completes and submits them.",
          date: "2023-03-05",
          isRead: false,
          category: "academic",
          priority: "high",
          responseRequired: true
        }
      ];
      
      // Apply filters from query parameters
      let filteredFeedback = [...mockFeedback];
      
      if (childId) {
        filteredFeedback = filteredFeedback.filter(f => f.childId === childId);
      }
      
      if (category) {
        filteredFeedback = filteredFeedback.filter(f => f.category === category);
      }
      
      if (isRead !== undefined) {
        const isReadBool = isRead === 'true';
        filteredFeedback = filteredFeedback.filter(f => f.isRead === isReadBool);
      }
      
      if (startDate) {
        filteredFeedback = filteredFeedback.filter(f => 
          new Date(f.date) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filteredFeedback = filteredFeedback.filter(f => 
          new Date(f.date) <= new Date(endDate)
        );
      }
      
      console.log(`[PARENT-CONTROLLER] getFeedback - Returning ${filteredFeedback.length} feedback items`);
      return res.status(200).json({
        error: false,
        data: filteredFeedback,
        message: 'Feedback messages retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting feedback:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve feedback messages'
      });
    }
  },
  
  /**
   * Get feedback responses for a specific feedback message
   */
  async getFeedbackResponses(req: Request, res: Response) {
    console.log('[PARENT-CONTROLLER] getFeedbackResponses - Processing request');
    try {
      const parentId = req.user?.id;
      const feedbackId = req.params.feedbackId;
      
      console.log('[PARENT-CONTROLLER] getFeedbackResponses - Parent ID:', parentId);
      console.log('[PARENT-CONTROLLER] getFeedbackResponses - Feedback ID:', feedbackId);
      
      if (!parentId) {
        console.log('[PARENT-CONTROLLER] getFeedbackResponses - Authentication error: No parent ID');
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      if (!feedbackId) {
        console.log('[PARENT-CONTROLLER] getFeedbackResponses - Missing feedback ID');
        return res.status(400).json({
          error: true,
          message: 'Feedback ID is required'
        });
      }
      
      // In a real application, you would verify that the feedback belongs to the parent's child
      // and then fetch the responses from the database
      // const feedback = await feedbackModel.findById(feedbackId);
      // if (feedback.childId not in parent's children) return 403
      // const responses = await feedbackModel.getResponses(feedbackId);
      
      // For now, we'll return mock data
      const mockResponses = [
        {
          id: "r1",
          feedbackId: "f2",
          senderId: "p1",
          senderType: "parent",
          senderName: "Mrs. Johnson",
          message: "Thank you for letting me know. We'll ensure Emma arrives on time going forward.",
          date: "2023-03-15T14:30:00",
          isRead: true
        },
        {
          id: "r2",
          feedbackId: "f2",
          senderId: "t2",
          senderType: "teacher",
          senderName: "Ms. Thompson",
          message: "Thank you for your prompt response. Please let me know if you need any assistance.",
          date: "2023-03-15T15:45:00",
          isRead: false
        }
      ];
      
      // Filter responses for the requested feedback
      const filteredResponses = mockResponses.filter(
        response => response.feedbackId === feedbackId
      );
      
      console.log(`[PARENT-CONTROLLER] getFeedbackResponses - Returning ${filteredResponses.length} responses`);
      return res.status(200).json({
        error: false,
        data: filteredResponses,
        message: 'Feedback responses retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting feedback responses:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to retrieve feedback responses'
      });
    }
  },
  
  /**
   * Respond to a feedback message
   */
  async respondToFeedback(req: Request, res: Response) {
    console.log('[PARENT-CONTROLLER] respondToFeedback - Processing request');
    try {
      const parentId = req.user?.id;
      const feedbackId = req.params.feedbackId;
      const { message } = req.body;
      
      console.log('[PARENT-CONTROLLER] respondToFeedback - Parent ID:', parentId);
      console.log('[PARENT-CONTROLLER] respondToFeedback - Feedback ID:', feedbackId);
      console.log('[PARENT-CONTROLLER] respondToFeedback - Message:', message);
      
      if (!parentId) {
        console.log('[PARENT-CONTROLLER] respondToFeedback - Authentication error: No parent ID');
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      if (!feedbackId) {
        console.log('[PARENT-CONTROLLER] respondToFeedback - Missing feedback ID');
        return res.status(400).json({
          error: true,
          message: 'Feedback ID is required'
        });
      }
      
      if (!message) {
        console.log('[PARENT-CONTROLLER] respondToFeedback - Missing message');
        return res.status(400).json({
          error: true,
          message: 'Response message is required'
        });
      }
      
      // In a real application, you would verify that the feedback belongs to the parent's child
      // and then save the response to the database
      // const feedback = await feedbackModel.findById(feedbackId);
      // if (feedback.childId not in parent's children) return 403
      // await feedbackModel.addResponse(feedbackId, parentId, message);
      
      console.log('[PARENT-CONTROLLER] respondToFeedback - Response saved successfully');
      return res.status(200).json({
        error: false,
        data: {
          id: Math.random().toString(36).substring(2, 9),
          feedbackId,
          senderId: parentId,
          senderType: 'parent',
          senderName: 'Parent',
          message,
          date: new Date().toISOString(),
          isRead: false
        },
        message: 'Response sent successfully'
      });
      
    } catch (error) {
      console.error('[PARENT-CONTROLLER] respondToFeedback - Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error responding to feedback'
      });
    }
  },
  
  /**
   * Mark a feedback message as read
   */
  async markFeedbackAsRead(req: Request, res: Response) {
    console.log('[PARENT-CONTROLLER] markFeedbackAsRead - Processing request');
    try {
      const parentId = req.user?.id;
      const feedbackId = req.params.feedbackId;
      
      console.log('[PARENT-CONTROLLER] markFeedbackAsRead - Parent ID:', parentId);
      console.log('[PARENT-CONTROLLER] markFeedbackAsRead - Feedback ID:', feedbackId);
      
      if (!parentId) {
        console.log('[PARENT-CONTROLLER] markFeedbackAsRead - Authentication error: No parent ID');
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      if (!feedbackId) {
        console.log('[PARENT-CONTROLLER] markFeedbackAsRead - Missing feedback ID');
        return res.status(400).json({
          error: true,
          message: 'Feedback ID is required'
        });
      }
      
      // In a real application, you would verify that the feedback belongs to the parent's child
      // and then update the feedback status in the database
      // const feedback = await feedbackModel.findById(feedbackId);
      // if (feedback.childId not in parent's children) return 403
      // await feedbackModel.markAsRead(feedbackId);
      
      console.log('[PARENT-CONTROLLER] markFeedbackAsRead - Feedback marked as read successfully');
      return res.status(200).json({
        error: false,
        data: {
          success: true,
          message: 'Feedback marked as read'
        },
        message: 'Feedback marked as read'
      });
    } catch (error) {
      console.error('Error marking feedback as read:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to mark feedback as read'
      });
    }
  }
}; 