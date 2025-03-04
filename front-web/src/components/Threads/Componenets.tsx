// src/components/Comment.tsx
import { Comment as CommentType } from "@/types/thread";
import { ArrowDown, ArrowUp, Reply } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CommentProps {
  comment: CommentType;
  onReply?: (parentId: string) => void;
}

const Comment = ({ comment, onReply }: CommentProps) => {
  const [vote, setVote] = useState<"up" | "down" | null>(comment.userVote || null);
  const [score, setScore] = useState(comment.upvotes - comment.downvotes);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleVote = (type: "up" | "down") => {
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

  const handleReplySubmit = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id);
      setIsReplying(false);
      setReplyText("");
    }
  };

  return (
    <div className="flex space-x-3 animate-fade-in">
      <div className="flex flex-col items-center space-y-1">
        <button
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
        <div className="bg-white rounded-lg p-3 shadow-subtle">
          <div className="flex items-center mb-2">
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="h-6 w-6 rounded-full mr-2"
            />
            <span className="font-medium text-sm mr-2">{comment.author.name}</span>
            <div className={`role-badge-${comment.author.role}`}>
              {comment.author.role}
            </div>
            <span className="text-gray-400 text-xs ml-2">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 text-sm">{comment.content}</p>
        </div>
        <div className="mt-1 flex items-center">
          <button 
            className="flex items-center text-xs text-gray-500 hover:text-primary transition-colors py-1"
            onClick={() => setIsReplying(!isReplying)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </button>
        </div>
        {isReplying && (
          <div className="mt-3 animate-fade-in">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button 
                className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                onClick={handleReplySubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
