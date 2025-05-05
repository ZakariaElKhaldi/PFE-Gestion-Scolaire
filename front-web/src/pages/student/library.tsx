import { useState } from "react"
import { User } from "../../types/auth"
import { StudentLayout } from "../../components/dashboard/layout/student-layout"
import { Search, BookOpen, FileText, Video, Bookmark, ExternalLink, Filter, Clock, Star, Plus, ChevronDown, Heart, HeartOff, Download, BarChart, Calendar, Clock12, BookmarkCheck, TrendingUp } from "lucide-react"

interface StudentLibraryProps {
  user: User
}

interface Resource {
  id: string
  title: string
  type: "book" | "video" | "article" | "document"
  format: string
  category: string
  description: string
  author: string
  dateAdded: string
  size?: string
  duration?: string
  count?: number
  isBookmarked: boolean
  rating: number
  coverImage?: string
  progress?: number
  lastAccessed?: string
  recommendedFor?: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

export default function StudentLibrary({ user }: StudentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedFormat, setSelectedFormat] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [showBookmarked, setShowBookmarked] = useState(false)
  const [showRecommended, setShowRecommended] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "rating" | "progress">("date")
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "r1",
      title: "Advanced Mathematics",
      type: "book",
      format: "PDF",
      category: "Mathematics",
      description: "Comprehensive guide to advanced mathematics concepts for university students.",
      author: "Dr. Maria Johnson",
      dateAdded: "2024-12-10",
      size: "12.4 MB",
      isBookmarked: true,
      rating: 4.8,
      progress: 65,
      lastAccessed: "2025-03-06",
      recommendedFor: ["Calculus", "Linear Algebra"],
      difficulty: "advanced"
    },
    {
      id: "r2",
      title: "Physics Fundamentals",
      type: "video",
      format: "MP4",
      category: "Physics",
      description: "Video series covering foundational physics concepts and practical examples.",
      author: "Prof. Robert Chen",
      dateAdded: "2025-01-15",
      duration: "12 Videos • 8.5 hours",
      isBookmarked: false,
      rating: 4.6,
      progress: 30,
      lastAccessed: "2025-03-05",
      recommendedFor: ["Mechanics", "Thermodynamics"],
      difficulty: "intermediate"
    },
    // ... other resources ...
  ])

  const categories = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Economics", "Literature", "History"]
  const formats = ["PDF", "EPUB", "MP4", "MP3", "DOC", "PPT"]
  const difficulties = ["beginner", "intermediate", "advanced"]

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleToggleBookmark = (id: string) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === id 
          ? { ...resource, isBookmarked: !resource.isBookmarked } 
          : resource
      )
    )
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.author.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    const matchesFormat = selectedFormat === "all" || resource.format === selectedFormat
    const matchesDifficulty = selectedDifficulty === "all" || resource.difficulty === selectedDifficulty
    const matchesBookmarked = !showBookmarked || resource.isBookmarked
    const matchesRecommended = !showRecommended || (resource.recommendedFor || []).length > 0
    
    return matchesSearch && matchesCategory && matchesFormat && matchesDifficulty && matchesBookmarked && matchesRecommended
  }).sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      case "rating":
        return b.rating - a.rating
      case "progress":
        return (b.progress || 0) - (a.progress || 0)
      default:
        return 0
    }
  })

  const getResourceIcon = (type: Resource["type"]) => {
    switch (type) {
      case "book":
        return <BookOpen className="h-6 w-6 text-blue-600" />
      case "video":
        return <Video className="h-6 w-6 text-purple-600" />
      case "article":
        return <FileText className="h-6 w-6 text-green-600" />
      case "document":
        return <FileText className="h-6 w-6 text-orange-600" />
      default:
        return <FileText className="h-6 w-6 text-gray-600" />
    }
  }

  const getDifficultyColor = (difficulty: Resource["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-50"
      case "intermediate":
        return "text-yellow-600 bg-yellow-50"
      case "advanced":
        return "text-red-600 bg-red-50"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-600"
    if (progress >= 50) return "bg-yellow-600"
    return "bg-blue-600"
  }

  const recentlyAccessed = [...resources]
    .filter(r => r.lastAccessed)
    .sort((a, b) => new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime())
    .slice(0, 3)

  const recommendedResources = resources.filter(r => (r.recommendedFor || []).length > 0).slice(0, 3)

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Digital Library</h1>
            <p className="mt-1 text-sm text-gray-500">
              Access educational resources and study materials
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowRecommended(!showRecommended)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
                showRecommended 
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Recommended
            </button>
            <button 
              onClick={() => setShowBookmarked(!showBookmarked)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
                showBookmarked 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              Saved ({resources.filter(r => r.isBookmarked).length})
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Resources in Progress</h3>
              <BarChart className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {resources.filter(r => r.progress && r.progress > 0 && r.progress < 100).length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Completed Resources</h3>
              <BookmarkCheck className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {resources.filter(r => r.progress === 100).length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Recently Accessed</h3>
              <Clock12 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {recentlyAccessed.length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Recommended</h3>
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {recommendedResources.length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-lg border bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Formats</option>
              {formats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "progress")}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="rating">Sort by Rating</option>
              <option value="progress">Sort by Progress</option>
            </select>
          </div>
        </div>

        {/* Recently Accessed */}
        {recentlyAccessed.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {recentlyAccessed.map(resource => (
                <div key={resource.id} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-500">{resource.author}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleBookmark(resource.id)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Bookmark className={`h-5 w-5 ${resource.isBookmarked ? "fill-current text-blue-600" : ""}`} />
                    </button>
                  </div>
                  {resource.progress !== undefined && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{resource.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(resource.progress)}`}
                          style={{ width: `${resource.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">All Resources</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map(resource => (
              <div key={resource.id} className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-500">{resource.author}</p>
                  </div>
                  <button
                    onClick={() => handleToggleBookmark(resource.id)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Bookmark className={`h-5 w-5 ${resource.isBookmarked ? "fill-current text-blue-600" : ""}`} />
                  </button>
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{resource.description}</p>

                {resource.recommendedFor && (resource.recommendedFor || []).length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-gray-500">Recommended for:</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(resource.recommendedFor || []).map(topic => (
                        <span
                          key={topic}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    {resource.duration ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {resource.duration}
                      </span>
                    ) : resource.size ? (
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {resource.size}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{resource.rating}</span>
                  </div>
                </div>

                {resource.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{resource.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(resource.progress)}`}
                        style={{ width: `${resource.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}