import React, { useState, useEffect } from 'react';
import { User } from '../../../types/auth';
import { ForumPost, ForumCategory } from '../../../types/forum';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown,
  Filter,
  Calendar,
  Tag,
  TrendingUp,
  Clock,
  Pin,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout';

interface ForumPageProps {
  user: User;
}

/**
 * Safely parse a date string and return a formatted ISO string
 * If the date is invalid, returns current date as ISO string
 */
function safeDateToISOString(date: Date | number): string {
  try {
    const newDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(newDate.getTime())) {
      console.warn('Invalid date encountered:', date);
      return new Date().toISOString();
    }
    
    return newDate.toISOString();
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date().toISOString();
  }
}

export const ForumPage = ({ user }: ForumPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);

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

    const mockPosts: ForumPost[] = [
      {
        id: 'post-1',
        title: 'Welcome to the new school forum!',
        content: 'This is a place for students, teachers, and parents to discuss various topics related to our school. Please keep discussions respectful and constructive.',
        authorId: 'admin-1',
        authorName: 'Principal Johnson',
        authorRole: 'administrator',
        authorAvatar: 'https://i.pravatar.cc/150?img=50',
        createdAt: safeDateToISOString(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: safeDateToISOString(Date.now() - 7 * 24 * 60 * 60 * 1000),
        category: 'announcements',
        tags: ['welcome', 'announcement', 'rules'],
        upvotes: 45,
        downvotes: 2,
        commentCount: 12,
        isPinned: true,
      },
      {
        id: 'post-2',
        title: 'Tips for preparing for final exams',
        content: 'With finals approaching, I wanted to share some study tips that have helped my students in the past...',
        authorId: 'teacher-1',
        authorName: 'Ms. Thompson',
        authorRole: 'teacher',
        authorAvatar: 'https://i.pravatar.cc/150?img=32',
        createdAt: safeDateToISOString(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: safeDateToISOString(Date.now() - 3 * 24 * 60 * 60 * 1000),
        category: 'academics',
        tags: ['exams', 'study', 'tips'],
        upvotes: 38,
        downvotes: 0,
        commentCount: 8,
        isPinned: false,
      },
      {
        id: 'post-3',
        title: 'Basketball team tryouts next week',
        content: 'The basketball team tryouts will be held next Monday after school. All interested students should bring appropriate athletic wear and a water bottle.',
        authorId: 'teacher-2',
        authorName: 'Coach Davis',
        authorRole: 'teacher',
        authorAvatar: 'https://i.pravatar.cc/150?img=60',
        createdAt: safeDateToISOString(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: safeDateToISOString(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: 'events',
        tags: ['sports', 'basketball', 'tryouts'],
        upvotes: 25,
        downvotes: 1,
        commentCount: 15,
        isPinned: false,
      },
      {
        id: 'post-4',
        title: 'Need help with calculus homework',
        content: 'I\'m struggling with the latest calculus assignment, specifically with integration by parts. Could someone explain it in simpler terms?',
        authorId: 'student-1',
        authorName: 'Alex Johnson',
        authorRole: 'student',
        authorAvatar: 'https://i.pravatar.cc/150?img=12',
        createdAt: safeDateToISOString(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: safeDateToISOString(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: 'help',
        tags: ['math', 'calculus', 'homework'],
        upvotes: 12,
        downvotes: 0,
        commentCount: 7,
        isPinned: false,
      },
      {
        id: 'post-5',
        title: 'Shared study resources for biology',
        content: 'I\'ve compiled a list of helpful resources for our biology class. Here are links to videos, practice quizzes, and study guides...',
        authorId: 'student-2',
        authorName: 'Emma Williams',
        authorRole: 'student',
        authorAvatar: 'https://i.pravatar.cc/150?img=5',
        createdAt: safeDateToISOString(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        updatedAt: safeDateToISOString(Date.now() - 12 * 60 * 60 * 1000),
        category: 'resources',
        tags: ['biology', 'study', 'resources'],
        upvotes: 30,
        downvotes: 0,
        commentCount: 5,
        isPinned: false,
      },
      {
        id: 'post-6',
        title: 'Parent-teacher conference schedule',
        content: 'The schedule for the upcoming parent-teacher conferences has been posted. Please sign up for a time slot as soon as possible.',
        authorId: 'admin-2',
        authorName: 'Vice Principal Smith',
        authorRole: 'administrator',
        authorAvatar: 'https://i.pravatar.cc/150?img=52',
        createdAt: safeDateToISOString(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        updatedAt: safeDateToISOString(Date.now() - 5 * 60 * 60 * 1000),
        category: 'announcements',
        tags: ['conference', 'schedule', 'parents'],
        upvotes: 18,
        downvotes: 0,
        commentCount: 3,
        isPinned: true,
      },
    ];

    setCategories(mockCategories);
    setPosts(mockPosts);
  }, []);

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    // Filter by search query
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory !== 'all' && post.category !== selectedCategory) {
      return false;
    }
    
    // Filter by tab
    if (activeTab === 'pinned' && !post.isPinned) {
      return false;
    }
    
    return true;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-commented':
        return b.commentCount - a.commentCount;
      case 'trending':
      default: {
        // Simple trending algorithm: upvotes - downvotes + (comments * 0.5)
        const trendingScoreA = a.upvotes - a.downvotes + (a.commentCount * 0.5);
        const trendingScoreB = b.upvotes - b.downvotes + (b.commentCount * 0.5);
        return trendingScoreB - trendingScoreA;
      }
    }
  });

  // Always show pinned posts at the top
  const pinnedPosts = sortedPosts.filter(post => post.isPinned);
  const nonPinnedPosts = sortedPosts.filter(post => !post.isPinned);
  const finalPosts = [...pinnedPosts, ...nonPinnedPosts];

  const handleCreatePost = () => {
    navigate('/dashboard/shared/forum/create');
  };

  const handleViewPost = (postId: string) => {
    navigate(`/dashboard/shared/forum/post/${postId}`);
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">School Forum</h1>
            <Button
              onClick={() => navigate('create')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Join the discussion with your fellow students, teachers, and staff.
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">School Forum</h1>
              <p className="text-sm text-gray-500">
                Discuss, share, and connect with the school community
              </p>
            </div>
            <Button onClick={handleCreatePost}>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar - Categories */}
            <div className="w-full md:w-64 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div 
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${selectedCategory === 'all' ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span>All Categories</span>
                    <Badge variant="outline">{posts.length}</Badge>
                  </div>
                  {categories.map(category => (
                    <div 
                      key={category.id}
                      className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${selectedCategory === category.id ? 'bg-gray-100 font-medium' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="outline">{category.postCount}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-4">
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search posts..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Trending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Newest</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Oldest</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="most-commented">
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Most Commented</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="pinned">Pinned</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Posts list */}
              <div className="space-y-4">
                {finalPosts.length > 0 ? (
                  finalPosts.map(post => (
                    <Card key={post.id} className={post.isPinned ? 'border-blue-200 bg-blue-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Vote buttons */}
                          <div className="flex flex-col items-center space-y-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Post content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {post.isPinned && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-gray-100">
                                {categories.find(c => c.id === post.category)?.name || post.category}
                              </Badge>
                            </div>
                            
                            <h3 
                              className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600"
                              onClick={() => handleViewPost(post.id)}
                            >
                              {post.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {post.content}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                                  <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{post.authorName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {post.authorRole}
                                </Badge>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8" onClick={() => handleViewPost(post.id)}>
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  {post.commentCount} comments
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8">
                                  <Bookmark className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No posts found. Try adjusting your filters or create a new post.</p>
                      <Button className="mt-4" onClick={handleCreatePost}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Post
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}; 