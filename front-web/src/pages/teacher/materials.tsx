import { useState } from "react"
import { User } from "../../types/auth"
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import { 
  BookOpen, FileText, Video, Download, Search, Plus, Upload, 
  Folder, MoreVertical, Edit, Trash2, Eye, BarChart, Filter,
  Calendar, Clock, CheckCircle, AlertCircle, Book, Settings,
  Users, ArrowUpRight, X
} from "lucide-react"

interface TeacherMaterialsProps {
  user: User
}

interface Material {
  id: string;
  title: string;
  type: "document" | "video" | "quiz" | "assignment";
  format: string;
  courseId: string;
  description: string;
  uploadDate: string;
  size?: string;
  duration?: string;
  downloads: number;
  views: number;
  status: "draft" | "published" | "archived";
  lastModified: string;
  folder?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Folder {
  id: string;
  name: string;
  courseId: string;
  materialsCount: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  folders: Folder[];
}

function UploadModal({ isOpen, onClose, courses, folders }: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Material["type"]>("document");
  const [courseId, setCourseId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [status, setStatus] = useState<Material["status"]>("draft");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle file upload and material creation
    console.log("Uploading material:", {
      title,
      description,
      type,
      courseId,
      folderId,
      status,
      file
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Material</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Material["type"])}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Material["status"])}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Folder (Optional)</option>
                  {folders
                    .filter(folder => !courseId || folder.courseId === courseId)
                    .map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, PPT, MP4, or ZIP up to 50MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Upload Material
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  materialTitle: string;
}

function DeleteModal({ isOpen, onClose, onConfirm, materialTitle }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Material</h2>
          <p className="text-gray-500">
            Are you sure you want to delete "{materialTitle}"? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherMaterials({ user }: TeacherMaterialsProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // Mock data
  const courses: Course[] = [
    { id: "c1", name: "Mathematics 101", code: "MATH101" },
    { id: "c2", name: "Physics 201", code: "PHYS201" },
    { id: "c3", name: "Computer Science", code: "CS101" }
  ];

  const folders: Folder[] = [
    { id: "f1", name: "Lecture Notes", courseId: "c1", materialsCount: 5 },
    { id: "f2", name: "Assignments", courseId: "c1", materialsCount: 3 },
    { id: "f3", name: "Lab Materials", courseId: "c2", materialsCount: 4 }
  ];

  const materials: Material[] = [
    {
      id: "m1",
      title: "Week 1: Introduction to Calculus",
      type: "document",
      format: "PDF",
      courseId: "c1",
      description: "Introduction to basic calculus concepts and derivatives",
      uploadDate: "2025-03-01",
      size: "2.5 MB",
      downloads: 45,
      views: 120,
      status: "published",
      lastModified: "2025-03-01",
      folder: "f1"
    },
    {
      id: "m2",
      title: "Vector Calculus Lecture",
      type: "video",
      format: "MP4",
      courseId: "c1",
      description: "Comprehensive lecture on vector calculus",
      uploadDate: "2025-03-03",
      duration: "45 minutes",
      downloads: 32,
      views: 98,
      status: "published",
      lastModified: "2025-03-03",
      folder: "f1"
    },
    {
      id: "m3",
      title: "Physics Lab Report Template",
      type: "document",
      format: "DOCX",
      courseId: "c2",
      description: "Template for writing physics lab reports",
      uploadDate: "2025-03-02",
      size: "1.2 MB",
      downloads: 28,
      views: 75,
      status: "published",
      lastModified: "2025-03-02",
      folder: "f3"
    }
  ];

  // Filter materials based on search and filters
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === "all" || material.courseId === selectedCourse;
    const matchesType = selectedType === "all" || material.type === selectedType;
    const matchesFolder = selectedFolder === "all" || material.folder === selectedFolder;
    const matchesStatus = selectedStatus === "all" || material.status === selectedStatus;
    
    return matchesSearch && matchesCourse && matchesType && matchesFolder && matchesStatus;
  });

  const getTypeIcon = (type: Material["type"]) => {
    switch (type) {
      case "document":
        return <FileText className="h-6 w-6 text-blue-600" />;
      case "video":
        return <Video className="h-6 w-6 text-purple-600" />;
      case "quiz":
        return <Book className="h-6 w-6 text-green-600" />;
      case "assignment":
        return <FileText className="h-6 w-6 text-orange-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Material["status"]) => {
    switch (status) {
      case "published":
        return "text-green-600 bg-green-100";
      case "draft":
        return "text-yellow-600 bg-yellow-100";
      case "archived":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleDelete = (id: string) => {
    setSelectedMaterial(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedMaterial) {
      // In a real application, this would delete the material from the backend
      console.log("Deleting material:", selectedMaterial);
      // Update local state to remove the material
      // setMaterials(prev => prev.filter(m => m.id !== selectedMaterial));
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and share teaching resources
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Upload Material
            </button>
            <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Materials Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Materials</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{materials.length}</p>
            <p className="mt-1 text-sm text-gray-500">Across all courses</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {materials.reduce((sum, m) => sum + m.views, 0)}
            </p>
            <p className="mt-1 text-sm text-gray-500">All time views</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {materials.reduce((sum, m) => sum + m.downloads, 0)}
            </p>
            <p className="mt-1 text-sm text-gray-500">Total downloads</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-600">2.8 GB</p>
            <p className="mt-1 text-sm text-gray-500">Of 10 GB total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-white p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="quiz">Quizzes</option>
              <option value="assignment">Assignments</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Materials List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
            <div className="text-sm text-gray-500">
              {filteredMaterials.length} {filteredMaterials.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          <div className="space-y-4">
            {filteredMaterials.map(material => {
              const course = courses.find(c => c.id === material.courseId);
              const folder = folders.find(f => f.id === material.folder);
              
              return (
                <div key={material.id} className="rounded-lg border bg-white p-6">
                  <div className="flex items-center gap-6">
                    <div className={`rounded-lg ${material.type === 'video' ? 'bg-purple-100' : 'bg-blue-100'} p-3`}>
                      {getTypeIcon(material.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="font-medium text-gray-900">{material.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{course?.name}</span>
                            {folder && (
                              <span className="flex items-center gap-1">
                                <Folder className="h-4 w-4" />
                                {folder.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(material.status)}`}>
                          {material.status.charAt(0).toUpperCase() + material.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {new Date(material.uploadDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="h-4 w-4" />
                          {material.views} views
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Download className="h-4 w-4" />
                          {material.downloads} downloads
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {material.size || material.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(material.id)}
                        className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="rounded-md bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100">
                        <BarChart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        courses={courses}
        folders={folders}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        materialTitle={materials.find(m => m.id === selectedMaterial)?.title || ""}
      />
    </DashboardLayout>
  )
}