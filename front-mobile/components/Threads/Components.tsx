import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import { Comment as CommentType } from '@/types/thread';
import Icon from 'react-native-vector-icons/Feather'; // Assuming you're using Feather icons
import { cn } from '@/utils/utils';

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
    <View style={styles.container}>
      <View style={styles.voteContainer}>
        <TouchableOpacity
          style={cn(styles.voteButton, vote === "up" && styles.voteButtonActive)}
          onPress={() => handleVote("up")}
        >
          <Icon name="arrow-up" size={16} color={vote === "up" ? "#3b82f6" : "#6b7280"} />
        </TouchableOpacity>
        <Text style={styles.scoreText}>{score}</Text>
        <TouchableOpacity
          style={cn(styles.voteButton, vote === "down" && styles.voteButtonActive)}
          onPress={() => handleVote("down")}
        >
          <Icon name="arrow-down" size={16} color={vote === "down" ? "#ef4444" : "#6b7280"} />
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <Image
              source={{ uri: comment.author.avatar }}
              style={styles.avatar}
            />
            <Text style={styles.authorName}>{comment.author.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{comment.author.role}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(comment.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
        <TouchableOpacity 
          style={styles.replyButton}
          onPress={() => setIsReplying(!isReplying)}
        >
          <Icon name="corner-up-left" size={12} color="#6b7280" />
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
        {isReplying && (
          <View style={styles.replyContainer}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Write a reply..."
              style={styles.replyInput}
              multiline
              numberOfLines={3}
            />
            <View style={styles.replyActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsReplying(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleReplySubmit}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  voteContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  voteButton: {
    padding: 8,
    borderRadius: 20,
  },
  voteButtonActive: {
    backgroundColor: '#f3f4f6',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
  },
  commentContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginRight: 8,
  },
  roleBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  roleText: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  replyText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  replyContainer: {
    marginTop: 12,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  submitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  submitText: {
    fontSize: 12,
    color: '#ffffff',
  },
});

export default Comment;