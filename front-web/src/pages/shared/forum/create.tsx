import { useState, useEffect } from 'react';
import { User } from '../../../types/auth';
import { ForumCategory } from '../../../types/forum';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Info,
  AlertTriangle,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { toast } from 'sonner';
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout';

interface CreatePostPageProps {
  user: User;
}

export const CreatePostPage = ({ user }: CreatePostPageProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would be an API call
    const mockCategories: ForumCategory[] = [
      { id: 'general', name: 'General Discussion', description: 'General topics related to the school', postCount: 45, isRestricted: false },
      { id: 'academics', name: 'Academics', description: 'Discussions about courses, assignments, and academic matters', postCount: 32, isRestricted: false },
      { id: 'events', name: 'Events & Activities', description: 'Upcoming events, activities, and extracurriculars', postCount: 18, isRestricted: false },
      { id: 'announcements', name: 'Announcements', description: 'Official announcements from the administration', postCount: 12, isRestricted: true, allowedRoles: ['administrator', 'teacher'] },
      { id: 'help', name: 'Help & Support', description: 'Get help with various school-related issues', postCount: 27, isRestricted: false },
      { id: 'resources', name: 'Resources', description: 'Sharing useful resources and materials', postCount: 21, isRestricted: false },
    ];

    setCategories(mockCategories);
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      if (tags.length < 5) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
        setTagInput('');
      } else {
        toast.error('You can add up to 5 tags per post');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!title.trim()) {
      setError('Please enter a title for your post');
      return;
    }

    if (!content.trim()) {
      setError('Please enter content for your post');
      return;
    }

    if (!category) {
      setError('Please select a category for your post');
      return;
    }

    // Check if user has permission to post in the selected category
    const selectedCategory = categories.find(c => c.id === category);
    if (selectedCategory?.isRestricted && selectedCategory.allowedRoles && 
        !selectedCategory.allowedRoles.includes(user.role)) {
      setError(`You don't have permission to post in the ${selectedCategory.name} category`);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your post has been created successfully!');
      navigate('/dashboard/shared/forum');
    }, 1500);
  };

  const handleCancel = () => {
    navigate('/dashboard/shared/forum');
  };

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Button>
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Discussion Thread</CardTitle>
            <CardDescription>
              Share your thoughts, questions, or information with the school community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for your post"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-500">
                  {title.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        disabled={category.isRestricted && category.allowedRoles && !category.allowedRoles.includes(user.role)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{category.name}</span>
                          {category.isRestricted && category.allowedRoles && !category.allowedRoles.includes(user.role) && (
                            <span className="text-xs text-gray-500 ml-2">(Restricted)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category && (
                  <p className="text-xs text-gray-500">
                    {categories.find(c => c.id === category)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags (optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="tags"
                      placeholder="Add tags (press Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pl-8"
                      maxLength={20}
                    />
                  </div>
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full hover:bg-gray-200 p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  You can add up to 5 tags to help categorize your post
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">Community Guidelines</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Please ensure your post follows our community guidelines. Be respectful, constructive, and avoid sharing personal information.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Post...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}; 