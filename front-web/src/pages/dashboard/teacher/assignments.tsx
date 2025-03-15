import { useState, useEffect } from "react";
import { User } from "../../../types/auth";
import { DashboardLayout } from "../../../components/dashboard/layout/dashboard-layout";
import { AssignmentCard } from "../../../components/dashboard/shared/assignment-card";
import { AssignmentForm } from "../../../components/dashboard/shared/assignment-form";
import { AssignmentGrading } from "../../../components/dashboard/teacher/assignment-grading";
import { Search, Plus } from "lucide-react";
import { Assignment, AssignmentWithDetails, SubmissionWithDetails } from "../../../types/assignment";
import { assignmentService } from "../../../services/assignment.service";
import { Dialog } from "@headlessui/react";
import { ApiRequestError } from '../../../types/api';

interface TeacherAssignmentsProps {
  user: User;
}

export default function TeacherAssignments({ user }: TeacherAssignmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Assignment["status"] | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        // Use the teacher-specific method
        const data = await assignmentService.getTeacherAssignments({
          status: selectedStatus === "all" ? undefined : selectedStatus
        });
        setAssignments(data);
        setError(null);
      } catch (err: unknown) {
        const error = err as ApiRequestError;
        setError("Failed to load assignments: " + (error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedStatus]);

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    return matchesSearch;
  });

  // Handle assignment creation
  const handleCreateAssignment = async (data: any) => {
    try {
      setIsSubmitting(true);
      // Use the teacher-specific method
      await assignmentService.createTeacherAssignment(data);
      setIsCreateModalOpen(false);
      
      // Refresh the list
      const updatedAssignments = await assignmentService.getTeacherAssignments({
        status: selectedStatus === "all" ? undefined : selectedStatus
      });
      setAssignments(updatedAssignments);
      
    } catch (error: any) {
      setError("Failed to create assignment: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle assignment grading
  const handleGradeSubmission = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (!selectedSubmission) return;
      
      // Use the teacher-specific method
      await assignmentService.gradeSubmissionAsTeacher(selectedSubmission.id, {
        grade: data.grade,
        feedback: data.feedback
      });
      
      setIsGradeModalOpen(false);
      
      // Refresh the list
      const updatedAssignments = await assignmentService.getTeacherAssignments({
        status: selectedStatus === "all" ? undefined : selectedStatus
      });
      setAssignments(updatedAssignments);
      
    } catch (error: any) {
      setError("Failed to grade submission: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle viewing assignment details
  const handleViewSubmissions = async (assignment: AssignmentWithDetails) => {
    try {
      setSelectedAssignment(assignment);
      const submissions = await assignmentService.getTeacherSubmissions(assignment.id);
      if (submissions.length > 0) {
        setSelectedSubmission(submissions[0]); // Show first submission
        setIsGradeModalOpen(true);
      } else {
        setError("No submissions found for this assignment");
      }
    } catch (error) {
      setError("Failed to load submissions: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage your assignments
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 inline-block mr-1" />
            Create Assignment
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Assignment["status"] | "all")}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Assignment Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Assignments</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{assignments.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Published</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">
              {assignments.filter(a => a.status === "published").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Closed</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {assignments.filter(a => a.status === "closed").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Draft</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {assignments.filter(a => a.status === "draft").length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-sm text-gray-500">Loading assignments...</p>
          </div>
        ) : (
          /* Assignments List */
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                role="teacher"
                onGrade={async () => {
                  await handleViewSubmissions(assignment);
                }}
                onView={() => {
                  // Handle viewing assignment details
                }}
              />
            ))}

            {filteredAssignments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No assignments found</p>
              </div>
            )}
          </div>
        )}

        {/* Create Assignment Modal */}
        <Dialog
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Create New Assignment
              </Dialog.Title>

              <AssignmentForm
                onSubmit={handleCreateAssignment}
                onCancel={() => setIsCreateModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Grade Assignment Modal */}
        <Dialog
          open={isGradeModalOpen}
          onClose={() => setIsGradeModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Grade Assignment: {selectedAssignment?.title}
              </Dialog.Title>

              {selectedSubmission && (
                <AssignmentGrading
                  submission={selectedSubmission}
                  onSubmit={handleGradeSubmission}
                  onCancel={() => setIsGradeModalOpen(false)}
                  isSubmitting={isSubmitting}
                />
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}