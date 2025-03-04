// src/types/index.ts
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: User;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  userVote?: 'up' | 'down' | null;
  commentsCount: number;
}
