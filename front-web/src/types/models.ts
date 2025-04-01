import { User } from "./auth"

export interface Course {
  id: string
  name: string
  code: string
  description: string
  teacherId: string
  teacher?: User
  startDate: string
  endDate: string
  credits: number
  maxStudents: number
  enrolledStudents: number
  status: "active" | "upcoming" | "completed"
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: string
  points: number
  status: "draft" | "published" | "closed"
  submissions: AssignmentSubmission[]
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  student?: User
  submittedAt: string
  grade?: number
  feedback?: string
  status: "submitted" | "graded" | "late"
}

export interface Material {
  id: string
  courseId: string
  title: string
  description: string
  type: "document" | "video" | "link"
  url: string
  uploadedBy: string
  uploadedAt: string
  size?: number
  duration?: number
}

export interface Message {
  id: string
  senderId: string
  sender?: User
  receiverId: string
  receiver?: User
  subject: string
  content: string
  sentAt: string
  readAt?: string
  status: "sent" | "delivered" | "read"
  isMine?: boolean
}

export interface Payment {
  id: string
  userId: string
  user?: User
  amount: number
  description: string
  status: "pending" | "completed" | "failed"
  paymentMethod: string
  transactionId?: string
  createdAt: string
  paidAt?: string
}

export interface Document {
  id: string
  userId: string
  user?: User
  title: string
  description: string
  type: string
  url: string
  size: number
  uploadedAt: string
  status: "pending" | "approved" | "rejected"
}

export interface Grade {
  id: string
  studentId: string
  student?: User
  courseId: string
  course?: Course
  assignmentId?: string
  assignment?: Assignment
  value: number
  type: "assignment" | "midterm" | "final" | "participation"
  gradedBy: string
  gradedAt: string
  comments?: string
}

export interface Attendance {
  id: string
  courseId: string
  course?: Course
  studentId: string
  student?: User
  date: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
}

export interface Child {
  id: string
  parentId: string
  parent?: User
  studentId: string
  student?: User
  relationship: "parent" | "guardian"
  isEmergencyContact: boolean
  canPickup: boolean
}

export interface Class {
  id: string
  courseId: string
  course?: Course
  teacherId: string
  teacher?: User
  room: string
  schedule: {
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
    startTime: string
    endTime: string
  }[]
  capacity: number
  enrolledCount: number
  status: "active" | "cancelled" | "completed"
} 