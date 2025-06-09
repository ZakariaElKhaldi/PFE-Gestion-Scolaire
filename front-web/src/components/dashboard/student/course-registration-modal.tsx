import { useState } from "react";
import { X } from "lucide-react";
import { Course } from "../../../services/course-service";

interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (courseIds: string[]) => void;
  availableCourses: Course[];
}

export function CourseRegistrationModal({
  isOpen,
  onClose,
  onRegister,
  availableCourses
}: CourseRegistrationModalProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleRegister = () => {
    onRegister(selectedCourses);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Course Registration</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Course List */}
        <div className="mt-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => handleToggleCourse(course.id)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <span className="text-sm text-gray-500">({course.code})</span>
                  </div>
                  <p className="text-sm text-gray-500">{course.teacherId}</p>
                  <p className="mt-1 text-sm text-gray-600">{course.description}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{course.credits} Credits</span>
                    <span>{course.maxStudents ? `0/${course.maxStudents} Enrolled` : 'Unlimited Enrollment'}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCourses.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No courses found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRegister}
            disabled={selectedCourses.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Register Selected Courses
          </button>
        </div>
      </div>
    </div>
  );
}
