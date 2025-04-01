import { useEffect, useState } from 'react';
import { Assignment } from '@/types/assignment';
import { Upload, X } from 'lucide-react';
import { teacherService } from '@/services/teacher.service';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { z } from "zod";

interface AssignmentFormProps {
  initialData?: Partial<Assignment>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Course interface to match API response
interface Course {
  id: string;
  name: string;
}

// Form validation schema
const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  course: z.string({ required_error: "Please select a course" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  points: z.string().optional(),
  file: z.instanceof(File).optional(),
});

export function AssignmentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}: AssignmentFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [courseId, setCourseId] = useState(initialData?.courseId || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [points, setPoints] = useState(initialData?.points?.toString() || '10');
  const [status, setStatus] = useState<Assignment['status']>(initialData?.status || 'draft');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Add state for courses - initialize as empty array
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState<string | null>(null);
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Fetch courses from the API
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      setCourseError(null);
      try {
        const fetchedCourses = await teacherService.getCourses();
        console.log('Courses fetched:', fetchedCourses);
        setCourses(fetchedCourses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourseError('Failed to load courses. Please try again.');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Initialize the form with better defaults for the date
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      course: initialData?.courseId || "",
      points: initialData?.points?.toString() || "100",
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
    },
  });

  // Add a more robust date formatter helper
  const formatDisplayDate = (date: Date | undefined): string => {
    if (!date) return "";
    try {
      return format(date, "PP"); // Use format from date-fns
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!courseId) {
      newErrors.courseId = 'Course is required';
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (!points || isNaN(Number(points)) || Number(points) <= 0) {
      newErrors.points = 'Points must be a positive number';
    }
    
    // Validate file size if a file is selected
    if (file && file.size > maxFileSize) {
      newErrors.file = `File size exceeds maximum allowed (10MB)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
    }
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
  };

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("courseId", values.course);
    
    // Format the date as YYYY-MM-DD, ensuring consistent timezone handling
    if (values.dueDate) {
      try {
        // Create new date to avoid modifying the original
        const date = new Date(values.dueDate);
        // Use ISO string and extract just the date part (YYYY-MM-DD)
        const dateString = date.toISOString().split('T')[0];
        formData.append("dueDate", dateString);
        console.log("Formatted due date:", dateString);
      } catch (error) {
        console.error("Error formatting due date:", error);
        // Fallback to direct string conversion if there's an error
        formData.append("dueDate", String(values.dueDate));
      }
    }
    
    formData.append("points", values.points || "100");
    
    // Add file if selected
    if (file) {
      formData.append("file", file);
    }
    
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full max-w-2xl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter assignment title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter assignment description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courseError ? (
                    <p className="p-2 text-red-500 text-sm">{courseError}</p>
                  ) : isLoadingCourses ? (
                    <p className="p-2 text-muted-foreground">Loading courses...</p>
                  ) : courses.length === 0 ? (
                    <p className="p-2 text-muted-foreground">No courses available</p>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date (Date Only)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatDisplayDate(field.value)
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        // Create a new date at noon to avoid timezone issues
                        const newDate = new Date(date);
                        // Set to noon to avoid timezone issues
                        newDate.setHours(12, 0, 0, 0);
                        field.onChange(newDate);
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    disabled={(date) => {
                      // Disable dates before today
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                    fromYear={2022}
                    toYear={2030}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Assignment points"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem>
              <FormLabel>Attachment (optional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Assignment"}
        </Button>
      </form>
    </Form>
  );
} 