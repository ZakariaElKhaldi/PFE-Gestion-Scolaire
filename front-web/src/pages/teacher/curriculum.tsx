import { useState } from "react"
import { User } from "../../types/auth"
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Link,
  Plus,
  Search,
  Settings,
  Share2,
  Target,
  Users,
  PlusCircle,
  MoreHorizontal,
  CheckSquare,
  Edit,
  Trash2,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface TeacherCurriculumProps {
  user: User
}

interface LessonPlan {
  id: string
  title: string
  subject: string
  grade: string
  duration: string
  objectives: string[]
  materials: string[]
  standards: string[]
  status: "draft" | "published" | "archived"
  lastModified: string
}

interface Unit {
  id: string
  title: string
  description: string
  subject: string
  grade: string
  lessons: LessonPlan[]
  progress: number
  startDate: string
  endDate: string
}

export default function TeacherCurriculum({ user }: TeacherCurriculumProps) {
  const [activeView, setActiveView] = useState<"plans" | "units" | "standards">("plans")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [showUnitForm, setShowUnitForm] = useState(false)

  // Mock data for lesson plans
  const lessonPlans: LessonPlan[] = [
    {
      id: "1",
      title: "Introduction to Quadratic Equations",
      subject: "Mathematics",
      grade: "10th Grade",
      duration: "45 minutes",
      objectives: [
        "Understand the basic form of quadratic equations",
        "Identify coefficients and constants",
        "Solve simple quadratic equations"
      ],
      materials: [
        "Textbook Chapter 5",
        "Interactive Whiteboard",
        "Practice Worksheets"
      ],
      standards: ["MATH.10.2A", "MATH.10.2B"],
      status: "published",
      lastModified: "2025-03-07T10:30:00"
    },
    {
      id: "2",
      title: "Cell Structure and Function",
      subject: "Biology",
      grade: "9th Grade",
      duration: "60 minutes",
      objectives: [
        "Identify main cell organelles",
        "Describe cell membrane function",
        "Compare plant and animal cells"
      ],
      materials: [
        "Microscopes",
        "Prepared Slides",
        "Cell Model Kit"
      ],
      standards: ["BIO.9.1A", "BIO.9.1B"],
      status: "draft",
      lastModified: "2025-03-06T15:45:00"
    }
  ]

  // Mock data for units
  const units: Unit[] = [
    {
      id: "1",
      title: "Algebra Fundamentals",
      description: "Core concepts of algebraic operations and equations",
      subject: "Mathematics",
      grade: "10th Grade",
      lessons: lessonPlans.filter(plan => plan.subject === "Mathematics"),
      progress: 65,
      startDate: "2025-02-01",
      endDate: "2025-03-15"
    },
    {
      id: "2",
      title: "Cell Biology",
      description: "Understanding cellular structures and processes",
      subject: "Biology",
      grade: "9th Grade",
      lessons: lessonPlans.filter(plan => plan.subject === "Biology"),
      progress: 40,
      startDate: "2025-02-15",
      endDate: "2025-03-30"
    }
  ]

  const filteredLessonPlans = lessonPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === "all" || plan.subject === selectedSubject
    const matchesGrade = selectedGrade === "all" || plan.grade === selectedGrade
    return matchesSearch && matchesSubject && matchesGrade
  })

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === "all" || unit.subject === selectedSubject
    const matchesGrade = selectedGrade === "all" || unit.grade === selectedGrade
    return matchesSearch && matchesSubject && matchesGrade
  })

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Curriculum Planning</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage lesson plans, units, and curriculum standards
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLessonForm(true)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Lesson
            </button>
            <button
              onClick={() => setShowUnitForm(true)}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FolderOpen className="h-4 w-4" />
              New Unit
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans and units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology">Biology</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Grades</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
            </select>
          </div>
          <div>
            <select
              value={activeView}
              onChange={(e) => setActiveView(e.target.value as typeof activeView)}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="plans">Lesson Plans</option>
              <option value="units">Units</option>
              <option value="standards">Standards</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {activeView === "plans" && (
          <div className="space-y-4">
            {filteredLessonPlans.map(plan => (
              <div
                key={plan.id}
                className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{plan.title}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>{plan.subject}</span>
                      <span>{plan.grade}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {plan.duration}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      plan.status === "published"
                        ? "bg-green-100 text-green-800"
                        : plan.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Objectives</h4>
                    <ul className="mt-2 space-y-1">
                      {plan.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Materials</h4>
                    <ul className="mt-2 space-y-1">
                      {plan.materials.map((material, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Standards</h4>
                    <ul className="mt-2 space-y-1">
                      {plan.standards.map((standard, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Link className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {standard}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === "units" && (
          <div className="space-y-4">
            {filteredUnits.map(unit => (
              <div
                key={unit.id}
                className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{unit.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{unit.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>{unit.subject}</span>
                      <span>{unit.grade}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(unit.startDate).toLocaleDateString()} - {new Date(unit.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{unit.progress}%</span>
                    <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${unit.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Lessons ({unit.lessons.length})</h4>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {unit.lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className="rounded-lg border bg-gray-50 p-3"
                      >
                        <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                        <p className="mt-1 text-sm text-gray-500">{lesson.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === "standards" && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-medium text-gray-900">Curriculum Standards</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and align your lessons with curriculum standards
            </p>
            {/* Standards content would go here */}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
