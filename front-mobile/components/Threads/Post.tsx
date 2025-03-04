// src/components/Post.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowDown, ArrowUp, MessageSquare, Share } from "lucide-react-native"; // Import corresponding React Native icons
import { Post as PostType } from "@/types/thread";
import Comment from "@/components/Threads/Components";

interface PostProps {
  post: PostType;
}

const Post = ({ post }: PostProps) => {
  const [expanded, setExpanded] = useState(false);
  const [vote, setVote] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleVote = (direction: "up" | "down") => {
    if (vote === direction) {
      setVote(null);
      setScore(direction === "up" ? score - 1 : score + 1);
    } else {
      const oldVote = vote;
      setVote(direction);

      if (oldVote === null) {
        setScore(direction === "up" ? score + 1 : score - 1);
      } else {
        setScore(direction === "up" ? score + 2 : score - 2);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    ).replace("in ", "") + " ago";
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
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.voteSection}>
          {vote === "up" && (
            <TouchableOpacity 
              onPress={() => handleVote("up")} 
              style={styles.voteButton}
            >
              <ArrowUp style={styles.icon} />
            </TouchableOpacity>
          )}
          <Text style={styles.voteScore}>{score}</Text>
          {vote === "down" && (
            <TouchableOpacity 
              onPress={() => handleVote("down")} 
              style={styles.voteButton}
            >
              <ArrowDown style={styles.icon} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.postContent}>
          <View style={styles.authorInfo}>
            <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.authorRole}>{post.author.role}</Text>
              <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{post.title}</Text>

          <Text style={styles.content}>
            {expanded || post.content.length < 200 ? (
              post.content
            ) : (
              <>
                {post.content.substring(0, 200)}...{" "}
                <TouchableOpacity onPress={() => setExpanded(true)}>
                  <Text style={styles.seeMore}>See more</Text>
                </TouchableOpacity>
              </>
            )}
          </Text>

          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.image} />
          )}

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.actionButton}>
              <MessageSquare style={styles.icon} />
              <Text style={styles.actionText}>{post.commentsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share style={styles.icon} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {(showComments || isCommenting) && (
        <View style={styles.commentSection}>
          {!isCommenting ? (
            <TouchableOpacity onPress={() => setIsCommenting(true)} style={styles.addCommentButton}>
              <Text style={styles.addCommentText}>Add Comment</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.commentInput}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write a comment..."
                style={styles.textArea}
                multiline
              />
              <View style={styles.commentActions}>
                <TouchableOpacity style={styles.imageButton}>
                  <Text style={styles.imageButtonText}>Add Image</Text>
                </TouchableOpacity>
                <View style={styles.commentButtons}>
                  <TouchableOpacity onPress={() => setIsCommenting(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCommentSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {showComments && (
            <View style={styles.commentList}>
              {post.comments.map((comment) => (
                <Comment key={comment.id} comment={comment} onReply={handleReply} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  voteSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  voteButton: {
    padding: 8,
  },
  voteScore: {
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    width: 16,
    height: 16,
  },
  postContent: {
    flex: 1,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorName: {
    fontWeight: "bold",
  },
  authorRole: {
    fontSize: 12,
    color: "#6B7280",
  },
  postDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 16,
  },
  seeMore: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  commentSection: {
    marginTop: 24,
    paddingLeft: 40,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  addCommentButton: {
    padding: 8,
    backgroundColor: "#F59E0B", // Example color for add comment button
    borderRadius: 8,
    marginBottom: 16,
  },
  addCommentText: {
    color: "white",
    fontWeight: "600",
  },
  commentInput: {
    marginBottom: 24,
  },
  textArea: {
    width: "100%",
    padding: 12,
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageButtonText: {
    color: "#6B7280",
    fontSize: 14,
  },
  commentButtons: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    padding: 8,
    backgroundColor: "#D1D5DB",
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 14,
  },
  submitButton: {
    padding: 8,
    backgroundColor: "#1D4ED8",
    borderRadius: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
  },
  commentList: {
    marginTop: 16,
  },
});

export default Post;
