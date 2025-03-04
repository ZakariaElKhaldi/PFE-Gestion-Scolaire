// src/components/Post.tsx
import { useState } from "react";
import { ArrowDown, ArrowUp, Image, MessageSquare, Share } from "lucide-react";
import { Post as PostType } from "@/types/thread";
import { cn } from "@/lib/utils";
import Comment from "@/components/Threads/Componenets";

interface PostProps {
  post: PostType;
}

const Post = ({ post }: PostProps) => {
  const [expanded, setExpanded] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(post.userVote || null);
  const [score, setScore] = useState(post.upvotes - post.downvotes);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleVote = (type: "up" | "down") => {
    // Apply a nice animation effect when voting
    const voteButton = document.getElementById(`vote-${type}-${post.id}`);
    if (voteButton) {
      voteButton.classList.add("animate-vote-ping");
      setTimeout(() => {
        voteButton.classList.remove("animate-vote-ping");
      }, 400);
    }
    
    if (vote === type) {
      setVote(null);
      setScore(type === "up" ? score - 1 : score + 1);
    } else {
      const oldVote = vote;
      setVote(type);
      
      if (oldVote === null) {
        setScore(type === "up" ? score + 1 : score - 1);
      } else {
        setScore(type === "up" ? score + 2 : score - 2);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    ).replace('in ', '') + ' ago';
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      console.log("Comment submitted:", commentText);
      setCommentText("");
      setIsCommenting(false);
      setShowComments(true);
    }
  };

  const handleReply = (parentId: string) => {
    console.log("Reply to comment:", parentId);
  };

  return (
    <div className="bg-white rounded-xl shadow-subtle overflow-hidden card-hover mb-6 animate-fade-up">
      <div className="p-4 md:p-6">
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center space-y-1">
            <button
              id={`vote-up-${post.id}`}
              className={cn(
                "vote-btn",
                vote === "up" && "vote-btn-active text-primary"
              )}
              onClick={() => handleVote("up")}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">{score}</span>
            <button
              id={`vote-down-${post.id}`}
              className={cn(
                "vote-btn",
                vote === "down" && "vote-btn-active text-destructive"
              )}
              onClick={() => handleVote("down")}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center mb-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-8 w-8 rounded-full mr-2"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{post.author.name}</span>
                  <div className={`role-badge-${post.author.role}`}>
                    {post.author.role}
                  </div>
                </div>
                <span className="text-gray-400 text-xs">
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
            
            <div className="text-gray-700 mb-4">
              {expanded || post.content.length < 200 ? (
                post.content
              ) : (
                <>
                  {post.content.substring(0, 200)}...{" "}
                  <button
                    className="text-primary hover:text-primary-600 font-medium"
                    onClick={() => setExpanded(true)}
                  >
                    See more
                  </button>
                </>
              )}
            </div>

            {post.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto object-cover max-h-[400px]"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex items-center space-x-4 text-gray-500">
              <button
                className="flex items-center hover:text-primary transition-colors"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="text-sm">{post.commentsCount}</span>
              </button>
              <button className="flex items-center hover:text-primary transition-colors">
                <Share className="h-4 w-4 mr-1" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>

        {(showComments || isCommenting) && (
          <div className="mt-6 pl-10 border-t pt-4">
            {!isCommenting ? (
              <button
                className="btn-secondary text-sm mb-4"
                onClick={() => setIsCommenting(true)}
              >
                Add Comment
              </button>
            ) : (
              <div className="mb-6 animate-fade-in">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
                    <Image className="h-4 w-4 mr-1" />
                    Add Image
                  </button>
                  <div className="space-x-2">
                    <button 
                      className="px-4 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsCommenting(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-4 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                      onClick={handleCommentSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showComments && (
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <Comment 
                    key={comment.id} 
                    comment={comment} 
                    onReply={handleReply}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
