import { User } from "../../../types/auth"
import { StudentLayout } from "../../../components/dashboard/layout/student-layout"
import { FileText, Video, Download, Search } from "lucide-react"

interface StudentMaterialsProps {
  user: User
}

export default function StudentMaterials({ user }: StudentMaterialsProps) {
  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
            <p className="mt-1 text-sm text-gray-500">
              Access your course materials and resources
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Materials Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Materials</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">24</p>
            <p className="mt-1 text-sm text-gray-500">Across all courses</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Recent Updates</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">5</p>
            <p className="mt-1 text-sm text-gray-500">In the last week</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Downloaded</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">12</p>
            <p className="mt-1 text-sm text-gray-500">This semester</p>
          </div>
        </div>

        {/* Materials List */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Materials</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Material Card */}
            <div className="rounded-lg border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Week 1: Introduction</h3>
                  <p className="text-sm text-gray-500">Mathematics 101</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">PDF • 2.3 MB</span>
                <button className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Material Card */}
            <div className="rounded-lg border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Lecture Recording</h3>
                  <p className="text-sm text-gray-500">Physics 201</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">MP4 • 45 min</span>
                <button className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
} 