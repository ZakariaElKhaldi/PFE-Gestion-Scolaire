import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../../../types/auth';
import { ForumPost, ForumComment, VoteType } from '../../../types/forum';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Card, 
  CardContent
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { 
  ArrowLeft, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown,
  Tag,
  Flag,
  Share,
  Bookmark,
  Edit,
  Trash,
  Reply
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout';

interface PostPageProps {
  user: User;
}

// Add isEdited property to ForumPost interface
interface ExtendedForumPost extends ForumPost {
  isEdited?: boolean;
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

export const PostPage = ({ user }: PostPageProps) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ExtendedForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<VoteType>('none');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would be an API call to fetch the post by ID
    const mockPost: ExtendedForumPost = {
      id: 'post-1',
      title: 'Welcome to the new school forum!',
      content: 'This is a place for students, teachers, and parents to discuss various topics related to our school. Please keep discussions respectful and constructive.\n\nHere are some guidelines to follow:\n\n1. Be respectful to others\n2. Stay on topic\n3. No spam or self-promotion\n4. Use appropriate language\n5. Report any inappropriate content\n\nWe hope this forum will be a valuable resource for our school community!',
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
    };

    const mockComments: ForumComment[] = [
      {
        id: 'comment-1',
        postId: 'post-1',
        content: 'Thank you for creating this forum! I think it will be very helpful for all of us.',
        authorId: 'teacher-1',
        authorName: 'Ms. Thompson',
        authorRole: 'teacher',
        authorAvatar: 'https://i.pravatar.cc/150?img=32',
        createdAt: safeDateToISOString(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: safeDateToISOString(Date.now() - 6 * 24 * 60 * 60 * 1000),
        upvotes: 12,
        downvotes: 0,
        isEdited: false,
      },
      {
        id: 'comment-2',
        postId: 'post-1',
        content: 'Looking forward to engaging with everyone here!',
        authorId: 'student-1',
        authorName: 'Alex Johnson',
        authorRole: 'student',
        authorAvatar: 'https://i.pravatar.cc/150?img=12',
        createdAt: safeDateToISOString(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: safeDateToISOString(Date.now() - 5 * 24 * 60 * 60 * 1000),
        upvotes: 8,
        downvotes: 0,
        isEdited: false,
      },
      {
        id: 'comment-3',
        postId: 'post-1',
        parentId: 'comment-2',
        content: 'Me too! This is going to be a great way to stay connected.',
        authorId: 'student-2',
        authorName: 'Emma Williams',
        authorRole: 'student',
        authorAvatar: 'https://i.pravatar.cc/150?img=5',
        createdAt: safeDateToISOString(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        updatedAt: safeDateToISOString(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        upvotes: 5,
        downvotes: 0,
        isEdited: false,
      },
      {
        id: 'comment-4',
        postId: 'post-1',
        content: 'As a parent, I appreciate having this platform to stay informed about school activities.',
        authorId: 'parent-1',
        authorName: 'David Smith',
        authorRole: 'parent',
        authorAvatar: 'https://i.pravatar.cc/150?img=67',
        createdAt: safeDateToISOString(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: safeDateToISOString(Date.now() - 4 * 24 * 60 * 60 * 1000),
        upvotes: 10,
        downvotes: 0,
        isEdited: false,
      },
    ];

    if (postId === 'post-1') {
      setPost(mockPost);
      setComments(mockComments);
    }
  }, [postId]);

  const handleBack = () => {
    navigate('/dashboard/shared/forum');
  };

  const handleVote = (type: VoteType) => {
    if (!post) return;

    // Toggle vote
    if (userVote === type) {
      setUserVote('none');
      if (type === 'upvote') {
        setPost({ ...post, upvotes: post.upvotes - 1 });
      } else {
        setPost({ ...post, downvotes: post.downvotes - 1 });
      }
    } else {
      // Remove previous vote if exists
      if (userVote === 'upvote') {
        setPost({ ...post, upvotes: post.upvotes - 1 });
      } else if (userVote === 'downvote') {
        setPost({ ...post, downvotes: post.downvotes - 1 });
      }

      // Add new vote
      setUserVote(type);
      if (type === 'upvote') {
        setPost({ ...post, upvotes: post.upvotes + 1 });
      } else {
        setPost({ ...post, downvotes: post.downvotes + 1 });
      }
    }
  };

  const handleCommentVote = (commentId: string, type: VoteType) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        if (type === 'upvote') {
          return { ...comment, upvotes: comment.upvotes + 1 };
        } else {
          return { ...comment, downvotes: comment.downvotes + 1 };
        }
      }
      return comment;
    }));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newCommentObj: ForumComment = {
        id: `comment-${Date.now()}`,
        postId: postId || '',
        content: newComment,
        authorId: user?.id || 'unknown',
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
        authorRole: user?.role || 'unknown',
        authorAvatar: user?.profilePicture, // Use profilePicture instead of avatar
        createdAt: safeDateToISOString(Date.now()),
        updatedAt: safeDateToISOString(Date.now()),
        upvotes: 0,
        downvotes: 0,
        isEdited: false,
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment('');
      setIsSubmitting(false);
      
      if (post) {
        setPost({
          ...post,
          commentCount: post.commentCount + 1
        });
      }
      
      toast.success('Comment added successfully!');
    }, 1000);
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReply: ForumComment = {
        id: `comment-${Date.now()}`,
        postId: postId || '',
        parentId: parentId,
        content: replyContent,
        authorId: user?.id || 'unknown',
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
        authorRole: user?.role || 'unknown',
        authorAvatar: user?.profilePicture, // Use profilePicture instead of avatar
        createdAt: safeDateToISOString(Date.now()),
        updatedAt: safeDateToISOString(Date.now()),
        upvotes: 0,
        downvotes: 0,
        isEdited: false,
      };
      
      setComments([...comments, newReply]);
      setReplyContent('');
      setReplyingTo(null);
      setIsSubmitting(false);
      
      if (post) {
        setPost({
          ...post,
          commentCount: post.commentCount + 1
        });
      }
      
      toast.success('Reply added successfully!');
    }, 1000);
  };

  // Organize comments into a tree structure for nested display
  const getCommentTree = () => {
    const topLevelComments = comments.filter(comment => !comment.parentId);
    const commentReplies = comments.filter(comment => comment.parentId);
    
    return topLevelComments.map(comment => {
      const replies = commentReplies.filter(reply => reply.parentId === comment.id);
      return {
        ...comment,
        replies
      };
    });
  };

  const commentTree = getCommentTree();

  if (!post) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Button>
          <div className="flex justify-center items-center h-[60vh]">
            <p className="text-gray-500">Post not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>

        {/* Post */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Vote buttons */}
              <div className="flex flex-col items-center space-y-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${userVote === 'upvote' ? 'text-green-600' : ''}`}
                  onClick={() => handleVote('upvote')}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${userVote === 'downvote' ? 'text-red-600' : ''}`}
                  onClick={() => handleVote('downvote')}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Post content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.isPinned && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Pinned
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-gray-100">
                    {post.category}
                  </Badge>
                </div>
                
                <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{post.authorName}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {post.authorRole}
                      </Badge>
                      <span>•</span>
                      <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                      {post.isEdited && (
                        <>
                          <span>•</span>
                          <span className="text-xs italic">edited</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="prose max-w-none mb-4">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.commentCount} Comments
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Bookmark className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Flag className="h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Comments ({post.commentCount})</h2>
          
          {/* Add comment */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea 
                    placeholder="Add a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Comments list */}
          {commentTree.length > 0 ? (
            <div className="space-y-4">
              {commentTree.map(comment => (
                <div key={comment.id} className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center space-y-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleCommentVote(comment.id, 'upvote')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium">{comment.upvotes - comment.downvotes}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleCommentVote(comment.id, 'downvote')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                              <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{comment.authorName}</div>
                            <Badge variant="outline" className="text-xs">
                              {comment.authorRole}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                            {comment.isEdited && (
                              <span className="text-xs italic text-gray-500">edited</span>
                            )}
                          </div>
                          
                          <div className="mb-3">
                            {comment.content}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-xs"
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            {comment.authorId === user.id && (
                              <>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                  <Trash className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                          
                          {/* Reply form */}
                          {replyingTo === comment.id && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200">
                              <div className="flex gap-2 items-start">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                                  <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                  <Textarea 
                                    placeholder={`Reply to ${comment.authorName}...`} 
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="min-h-[80px]"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleAddReply(comment.id)}
                                      disabled={isSubmitting || !replyContent.trim()}
                                    >
                                      {isSubmitting ? 'Posting...' : 'Post Reply'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Nested replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-8 space-y-3">
                      {comment.replies.map(reply => (
                        <Card key={reply.id}>
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center space-y-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5"
                                  onClick={() => handleCommentVote(reply.id, 'upvote')}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <span className="text-xs font-medium">{reply.upvotes - reply.downvotes}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5"
                                  onClick={() => handleCommentVote(reply.id, 'downvote')}
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={reply.authorAvatar} alt={reply.authorName} />
                                    <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="font-medium text-sm">{reply.authorName}</div>
                                  <Badge variant="outline" className="text-xs">
                                    {reply.authorRole}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                
                                <div className="text-sm mb-2">
                                  {reply.content}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}; 