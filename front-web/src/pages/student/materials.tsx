import { useState, useEffect } from "react"
import { User } from "../../types/auth"
import { StudentLayout } from "../../components/dashboard/layout/student-layout"
import { FileText, Video, Download, Search, Book, Filter, Clock, ChevronDown, Play, Eye, CheckCircle, BarChart } from "lucide-react"
import { materialService, Material, MaterialType, MaterialStatus, CourseProgressSummary, MaterialFilters } from "../../services/material-service"
import { toast } from "react-hot-toast"
import { format } from "date-fns"

interface StudentMaterialsProps {
  user: User
}

interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  progress: number;
  materialsCount: number;
}

export default function StudentMaterials({ user }: StudentMaterialsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgressSummary>>({});

  // Fetch materials and courses
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch materials
        const filters: MaterialFilters = {};
        if (selectedCourse !== "all") {
          filters.courseId = selectedCourse;
        }
        if (selectedType !== "all") {
          filters.type = selectedType as MaterialType;
        }
        if (!showCompleted) {
          filters.status = "not_started" as MaterialStatus;
        }
        if (searchQuery) {
          filters.search = searchQuery;
        }

        const materialsData = await materialService.getMaterialsForStudent(filters);
        setMaterials(materialsData);

        // Extract unique courses from materials
        const uniqueCourses = Array.from(
          new Set(materialsData.map(m => m.courseId))
        ).map(courseId => {
          const material = materialsData.find(m => m.courseId === courseId);
          return {
            id: courseId,
            name: material?.courseName || "",
            code: material?.courseCode || "",
            instructor: "",
            progress: 0,
            materialsCount: materialsData.filter(m => m.courseId === courseId).length
          };
        });

        setCourses(uniqueCourses);

        // Fetch progress for each course
        const progressPromises = uniqueCourses.map(async course => {
          try {
            const progress = await materialService.getCourseProgressSummary(course.id);
            return { courseId: course.id, progress };
          } catch (error) {
            console.error(`Error fetching progress for course ${course.id}:`, error);
            return { 
              courseId: course.id, 
              progress: { 
                totalMaterials: 0, 
                completed: 0, 
                inProgress: 0, 
                notStarted: 0, 
                overallProgress: 0 
              } 
            };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap: Record<string, CourseProgressSummary> = {};
        progressResults.forEach(result => {
          progressMap[result.courseId] = result.progress;
        });

        setCourseProgress(progressMap);

        // Update courses with progress
        setCourses(prevCourses => 
          prevCourses.map(course => ({
            ...course,
            progress: progressMap[course.id]?.overallProgress || 0
          }))
        );
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast.error("Failed to load materials. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse, selectedType, showCompleted, searchQuery]);

  const handleDownload = async (material: Material) => {
    try {
      const blob = await materialService.downloadMaterial(material.id);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = material.title + '.' + material.format.toLowerCase();
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update progress
      await materialService.updateProgress(material.id, {
        status: 'completed',
        progress: 100
      });
      
      // Update local state
      setMaterials(prevMaterials => 
        prevMaterials.map(m => 
          m.id === material.id 
            ? { ...m, status: 'completed', progress: 100 } 
            : m
        )
      );
      
      toast.success("Material downloaded successfully");
    } catch (error) {
      console.error("Error downloading material:", error);
      toast.error("Failed to download material. Please try again.");
    }
  };

  const handleViewMaterial = async (material: Material) => {
    try {
      // For videos or documents that can be viewed in browser
      if (material.fileUrl) {
        window.open(material.fileUrl, '_blank');
      }
      
      // Update progress
      await materialService.updateProgress(material.id, {
        status: 'in_progress',
        progress: material.progress ? Math.min(material.progress + 25, 99) : 50
      });
      
      // Update local state
      setMaterials(prevMaterials => 
        prevMaterials.map(m => 
          m.id === material.id 
            ? { 
                ...m, 
                status: 'in_progress', 
                progress: m.progress ? Math.min(m.progress + 25, 99) : 50 
              } 
            : m
        )
      );
    } catch (error) {
      console.error("Error viewing material:", error);
      toast.error("Failed to open material. Please try again.");
    }
  };

  const markAsCompleted = async (material: Material) => {
    try {
      await materialService.updateProgress(material.id, {
        status: 'completed',
        progress: 100
      });
      
      // Update local state
      setMaterials(prevMaterials => 
        prevMaterials.map(m => 
          m.id === material.id 
            ? { ...m, status: 'completed', progress: 100 } 
            : m
        )
      );
      
      toast.success("Material marked as completed");
    } catch (error) {
      console.error("Error marking material as completed:", error);
      toast.error("Failed to update progress. Please try again.");
    }
  };

  const getStatusColor = (status: MaterialStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: MaterialType) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "quiz":
        return <BarChart className="h-5 w-5" />;
      case "assignment":
        return <Book className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: MaterialType) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "quiz":
        return "bg-yellow-100 text-yellow-800";
      case "assignment":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMaterials = materials;

  return (
    <StudentLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
            <p className="mt-1 text-sm text-gray-500">
              Access all your course materials and track your progress
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search materials..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          <div className="flex gap-2">
            <div className="relative">
            <select
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
              ))}
            </select>
              <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="relative">
            <select
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="quiz">Quizzes</option>
              <option value="assignment">Assignments</option>
            </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showCompleted}
                  onChange={() => setShowCompleted(!showCompleted)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900">Show Completed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Course Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCourse(course.id === selectedCourse ? "all" : course.id)}
            >
              <div className="flex justify-between items-start mb-2">
        <div>
                  <h3 className="font-bold">{course.code}</h3>
                  <p className="text-sm text-gray-600">{course.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  course.progress >= 75 ? "bg-green-100 text-green-800" :
                  course.progress >= 50 ? "bg-blue-100 text-blue-800" :
                  course.progress >= 25 ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {course.progress}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{courseProgress[course.id]?.completed || 0} Completed</span>
                <span>{courseProgress[course.id]?.inProgress || 0} In Progress</span>
                <span>{courseProgress[course.id]?.notStarted || 0} Not Started</span>
              </div>
            </div>
          ))}
        </div>

        {/* Materials List */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="font-semibold">Materials</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-center">Loading materials...</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No materials found. Try adjusting your filters.
            </div>
          ) : (
            <div className="divide-y">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(material.type as MaterialType)}`}>
                        {getTypeIcon(material.type as MaterialType)}
                      </div>
                          <div>
                        <h3 className="font-medium">{material.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{material.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(material.uploadDate), "MMM d, yyyy")}
                          </span>
                          {material.duration && (
                            <span className="flex items-center text-xs text-gray-500">
                              <Clock className="mr-1 h-3 w-3" />
                              {material.duration} min
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(material.status as MaterialStatus)}`}>
                            {material.status === "completed" ? "Completed" :
                             material.status === "in_progress" ? "In Progress" : "Not Started"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {material.courseName} ({material.courseCode})
                          </span>
                        </div>
                        {material.status === "in_progress" && material.progress !== undefined && (
                          <div className="w-full mt-2 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${material.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {material.type === "document" && (
                        <button
                          onClick={() => handleDownload(material)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                      {material.type === "video" && (
                        <button
                          onClick={() => handleViewMaterial(material)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                          title="Play"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      )}
                      {(material.type === "document" || material.type === "quiz") && (
                        <button
                          onClick={() => handleViewMaterial(material)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                          </button>
                      )}
                      {material.status !== "completed" && (
                        <button
                          onClick={() => markAsCompleted(material)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}