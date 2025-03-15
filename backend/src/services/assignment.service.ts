import { assignmentModel, Assignment } from '../models/assignment.model';
import { submissionModel, Submission } from '../models/submission.model';
import { courseModel } from '../models/course.model';
import { userModel } from '../models/user.model';
import { courseEnrollmentModel } from '../models/course-enrollment.model';

export interface AssignmentFilters {
  courseId?: string;
  status?: 'draft' | 'published' | 'closed';
  title?: string;
  dueDate?: string;
  dueBefore?: string;
  dueAfter?: string;
}

// Interface for creating an assignment
export interface CreateAssignmentData {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  status: 'draft' | 'published' | 'closed';
}

// Interface for updating an assignment
export interface UpdateAssignmentData extends Partial<CreateAssignmentData> {}

// Interface for creating a submission
export interface CreateSubmissionData {
  assignmentId: string;
  studentId: string;
  submissionUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  status?: 'submitted' | 'graded' | 'late';
}

// Interface for grading a submission
export interface GradeSubmissionData {
  grade: number;
  feedback?: string;
}

// Extended assignment with course details and submission stats
export interface AssignmentWithDetails extends Assignment {
  course?: {
    id: string;
    name: string;
    code: string;
  };
  stats?: {
    submissionCount: number;
    gradedCount: number;
    averageGrade: number | null;
  };
}

// Extended submission with student and assignment details
export interface SubmissionWithDetails extends Submission {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignment?: {
    title: string;
    dueDate: string;
    points: number;
    courseId: string;
    courseName?: string;
  };
}

class AssignmentService {
  /**
   * Get all assignments with optional filters
   */
  async getAssignments(filters?: AssignmentFilters): Promise<AssignmentWithDetails[]> {
    // Get assignments with filters
    const assignments = await assignmentModel.findAll(filters);
    
    // Enhance assignments with course details and stats
    const enhancedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await courseModel.findById(assignment.courseId);
        
        // Get submission stats - handle database errors gracefully
        let submissionCount = 0;
        let gradedCount = 0;
        let averageGrade = null;
        
        try {
          submissionCount = await submissionModel.countByAssignment(assignment.id);
          gradedCount = await submissionModel.countByAssignment(assignment.id, 'graded');
          averageGrade = await submissionModel.getAverageGradeForAssignment(assignment.id);
        } catch (error) {
          console.warn(`Error getting submission stats for assignment ${assignment.id}:`, error);
          // Continue with default values if an error occurs
        }
        
        return {
          ...assignment,
          course: course ? {
            id: course.id,
            name: course.name,
            code: course.code
          } : undefined,
          stats: {
            submissionCount,
            gradedCount,
            averageGrade
          }
        };
      })
    );
    
    return enhancedAssignments;
  }

  /**
   * Get a single assignment by ID with details
   */
  async getAssignment(id: string): Promise<AssignmentWithDetails | null> {
    const assignment = await assignmentModel.findById(id);
    
    if (!assignment) return null;
    
    // Get course details
    const course = await courseModel.findById(assignment.courseId);
    
    // Get submission stats
    const submissionCount = await submissionModel.countByAssignment(id);
    const gradedCount = await submissionModel.countByAssignment(id, 'graded');
    const averageGrade = await submissionModel.getAverageGradeForAssignment(id);
    
    return {
      ...assignment,
      course: course ? {
        id: course.id,
        name: course.name,
        code: course.code
      } : undefined,
      stats: {
        submissionCount,
        gradedCount,
        averageGrade
      }
    };
  }

  /**
   * Create a new assignment
   */
  async createAssignment(assignmentData: CreateAssignmentData, teacherId: string): Promise<Assignment> {
    // Check if course exists
    const course = await courseModel.findById(assignmentData.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify that the teacher is associated with the course
    if (course.teacherId !== teacherId) {
      const user = await userModel.findById(teacherId);
      // Allow administrators to create assignments for any course
      if (!user || (user.role !== 'administrator' && user.id !== course.teacherId)) {
        throw new Error('You are not authorized to create assignments for this course');
      }
    }
    
    // Create assignment
    const assignmentId = await assignmentModel.create(assignmentData);
    
    // Get created assignment
    const assignment = await assignmentModel.findById(assignmentId);
    
    if (!assignment) {
      throw new Error('Failed to create assignment');
    }
    
    return assignment;
  }

  /**
   * Update an assignment
   */
  async updateAssignment(id: string, assignmentData: UpdateAssignmentData, teacherId: string): Promise<Assignment | null> {
    // Check if assignment exists
    const assignment = await assignmentModel.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Get the course to check permissions
    const course = await courseModel.findById(assignment.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify that the teacher is associated with the course
    if (course.teacherId !== teacherId) {
      const user = await userModel.findById(teacherId);
      // Allow administrators to update assignments for any course
      if (!user || (user.role !== 'administrator' && user.id !== course.teacherId)) {
        throw new Error('You are not authorized to update assignments for this course');
      }
    }
    
    // Update assignment
    const updated = await assignmentModel.update(id, assignmentData);
    
    if (!updated) {
      return null;
    }
    
    // Get updated assignment
    return assignmentModel.findById(id);
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(id: string, teacherId: string): Promise<boolean> {
    // Check if assignment exists
    const assignment = await assignmentModel.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Get the course to check permissions
    const course = await courseModel.findById(assignment.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify that the teacher is associated with the course
    if (course.teacherId !== teacherId) {
      const user = await userModel.findById(teacherId);
      // Allow administrators to delete assignments for any course
      if (!user || (user.role !== 'administrator' && user.id !== course.teacherId)) {
        throw new Error('You are not authorized to delete assignments for this course');
      }
    }
    
    // Delete assignment
    return assignmentModel.delete(id);
  }

  /**
   * Get assignments for a course
   */
  async getAssignmentsForCourse(courseId: string): Promise<Assignment[]> {
    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Get assignments
    return assignmentModel.getByCourse(courseId);
  }

  /**
   * Get upcoming assignments for a student
   */
  async getUpcomingAssignmentsForStudent(studentId: string, limit: number = 5): Promise<Assignment[]> {
    // Check if student exists
    const student = await userModel.findById(studentId);
    if (!student || student.role !== 'student') {
      throw new Error('Student not found');
    }
    
    // Get upcoming assignments for the student
    return assignmentModel.getUpcomingForStudent(studentId, limit);
  }

  /**
   * Get recent assignments for a teacher
   */
  async getRecentAssignmentsForTeacher(teacherId: string, limit: number = 10): Promise<Assignment[]> {
    // Check if teacher exists
    const teacher = await userModel.findById(teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    
    // Check if teacher role is correct
    if (teacher.role !== 'teacher' && teacher.role !== 'administrator') {
      throw new Error('User must be a teacher or administrator');
    }
    
    // Get recent assignments
    return assignmentModel.getRecentForTeacher(teacherId, limit);
  }

  /**
   * Submit an assignment
   */
  async submitAssignment(submissionData: CreateSubmissionData): Promise<Submission> {
    // Check if assignment exists
    const assignment = await assignmentModel.findById(submissionData.assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Check if student exists
    const student = await userModel.findById(submissionData.studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Check if student role is correct
    if (student.role !== 'student') {
      throw new Error('User must be a student to submit assignments');
    }
    
    // Check if student is enrolled in the course
    const isEnrolled = await courseEnrollmentModel.findByCourseAndStudent(
      assignment.courseId,
      submissionData.studentId
    );
    
    if (!isEnrolled) {
      throw new Error('Student is not enrolled in this course');
    }
    
    // Check if assignment is still open
    if (assignment.status === 'closed') {
      throw new Error('This assignment is closed and no longer accepting submissions');
    }
    
    // Determine if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const status = now > dueDate ? 'late' : 'submitted';
    
    // Create submission
    const submissionId = await submissionModel.create({
      ...submissionData,
      submittedAt: now.toISOString(),
      status
    });
    
    // Get created submission
    const submission = await submissionModel.findById(submissionId);
    
    if (!submission) {
      throw new Error('Failed to create submission');
    }
    
    return submission;
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    submissionId: string, 
    gradeData: GradeSubmissionData, 
    teacherId: string
  ): Promise<SubmissionWithDetails | null> {
    // Check if submission exists
    const submission = await submissionModel.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    // Get assignment to check permissions
    const assignment = await assignmentModel.findById(submission.assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Get course to check permissions
    const course = await courseModel.findById(assignment.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify that the teacher is associated with the course
    if (course.teacherId !== teacherId) {
      const user = await userModel.findById(teacherId);
      // Allow administrators to grade assignments for any course
      if (!user || (user.role !== 'administrator' && user.id !== course.teacherId)) {
        throw new Error('You are not authorized to grade assignments for this course');
      }
    }
    
    // Validate grade
    if (gradeData.grade < 0 || gradeData.grade > assignment.points) {
      throw new Error(`Grade must be between 0 and ${assignment.points} points`);
    }
    
    // Grade submission
    const graded = await submissionModel.grade(
      submissionId, 
      gradeData.grade, 
      gradeData.feedback
    );
    
    if (!graded) {
      return null;
    }
    
    // Get updated submission with details
    const updatedSubmission = await submissionModel.findById(submissionId);
    if (!updatedSubmission) {
      return null;
    }
    
    // Get student details
    const student = await userModel.findById(updatedSubmission.studentId);
    
    return {
      ...updatedSubmission,
      student: student ? {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email
      } : undefined,
      assignment: {
        title: assignment.title,
        dueDate: assignment.dueDate,
        points: assignment.points,
        courseId: assignment.courseId,
        courseName: course.name
      }
    };
  }

  /**
   * Get submissions for an assignment
   */
  async getSubmissionsForAssignment(assignmentId: string): Promise<SubmissionWithDetails[]> {
    // Check if assignment exists
    const assignment = await assignmentModel.findById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Get course
    const course = await courseModel.findById(assignment.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Get submissions with student details
    const submissions = await submissionModel.getSubmissionsWithStudentDetails(assignmentId);
    
    // Transform to SubmissionWithDetails objects
    return submissions.map(submission => ({
      ...submission,
      assignment: {
        title: assignment.title,
        dueDate: assignment.dueDate,
        points: assignment.points,
        courseId: assignment.courseId,
        courseName: course.name
      }
    }));
  }

  /**
   * Get submissions for a student
   */
  async getSubmissionsForStudent(studentId: string): Promise<SubmissionWithDetails[]> {
    // Check if student exists
    const student = await userModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Get submissions with assignment details
    return submissionModel.getSubmissionsWithAssignmentDetails(studentId);
  }
}

export const assignmentService = new AssignmentService(); 