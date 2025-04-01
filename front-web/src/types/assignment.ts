export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

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

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
  submissionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

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