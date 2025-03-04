// src/lib/data.ts
import { Post, User } from "@/types/thread";

export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  role: "admin",
  avatar: "https://i.pravatar.cc/150?img=1",
};

export const users: User[] = [
  currentUser,
  {
    id: "user-2",
    name: "Jane Smith",
    role: "teacher",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "user-3",
    name: "Bob Johnson",
    role: "student",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "user-4",
    name: "Emily Davis",
    role: "student",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: "user-5",
    name: "Michael Wilson",
    role: "teacher",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

export const posts: Post[] = [
  {
    id: "post-1",
    title: "Welcome to the New School Portal",
    content:
      "We're excited to launch our new Reddit-style school portal where administration can share important updates and everyone can engage in meaningful discussions.",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3",
    createdAt: new Date("2023-05-15T10:30:00Z"), // Use Date object
    author: users[0],
    upvotes: 42,
    downvotes: 3,
    userVote: "up",
    commentsCount: 2,
    comments: [
      {
        id: "comment-1",
        content: "This is a great initiative! Looking forward to using this platform.",
        createdAt: new Date("2023-05-15T11:15:00Z"), // Use Date object
        author: users[1],
        upvotes: 8,
        downvotes: 0,
        userVote: null,
      },
      {
        id: "comment-2",
        content: "Will there be a mobile app version as well?",
        createdAt: new Date("2023-05-15T12:45:00Z"), // Use Date object
        author: users[2],
        upvotes: 3,
        downvotes: 0,
        userVote: "up",
      },
    ],
  },
  {
    id: "post-2",
    title: "Upcoming Science Fair - May 25th",
    content:
      "The annual science fair is around the corner! Get your projects ready and register by May 20th. This year's theme is 'Sustainable Innovation'.",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3",
    createdAt: new Date("2023-05-14T09:15:00Z"), // Use Date object
    author: users[1],
    upvotes: 28,
    downvotes: 1,
    userVote: null,
    commentsCount: 1,
    comments: [
      {
        id: "comment-3",
        content: "I'm planning a project on renewable energy. Looking forward to presenting!",
        createdAt: new Date("2023-05-14T10:30:00Z"), // Use Date object
        author: users[3],
        upvotes: 5,
        downvotes: 0,
        userVote: null,
      },
    ],
  },
  {
    id: "post-3",
    title: "Computer Lab Upgrade Complete",
    content:
      "We've completed the upgrade of the computer lab with new hardware and software. Students can now access advanced design tools and programming environments.",
    imageUrl: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3",
    createdAt: new Date("2023-05-13T14:20:00Z"), // Use Date object
    author: users[0],
    upvotes: 35,
    downvotes: 0,
    userVote: "up",
    commentsCount: 2,
    comments: [
      {
        id: "comment-4",
        content: "Amazing upgrade! The new computers are much faster.",
        createdAt: new Date("2023-05-13T15:10:00Z"), // Use Date object
        author: users[3],
        upvotes: 7,
        downvotes: 0,
        userVote: "up",
      },
      {
        id: "comment-5",
        content: "Are we getting access to Adobe Creative Suite as well?",
        createdAt: new Date("2023-05-13T16:45:00Z"), // Use Date object
        author: users[4],
        upvotes: 4,
        downvotes: 0,
        userVote: null,
      },
    ],
  },
  {
    id: "post-4",
    title: "New Programming Course Available",
    content:
      "We're introducing a new Python programming course for beginners. No prior experience required! Classes start next month.",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3",
    createdAt: new Date("2023-05-12T11:30:00Z"), // Use Date object
    author: users[4],
    upvotes: 22,
    downvotes: 2,
    userVote: null,
    commentsCount: 1,
    comments: [
      {
        id: "comment-6",
        content: "Will this be available for all grade levels?",
        createdAt: new Date("2023-05-12T13:20:00Z"), // Use Date object
        author: users[2],
        upvotes: 2,
        downvotes: 0,
        userVote: null,
      },
    ],
  },
  {
    id: "post-5",
    title: "School Building Renovation Updates",
    content:
      "The east wing renovation is now 75% complete. We expect to open the new classrooms by the beginning of the next semester.",
    imageUrl: "https://images.unsplash.com/photo-1527576539890-dfa815648363?ixlib=rb-4.0.3",
    createdAt: new Date("2023-05-11T08:45:00Z"), // Use Date object
    author: users[0],
    upvotes: 18,
    downvotes: 1,
    userVote: "down",
    commentsCount: 1,
    comments: [
      {
        id: "comment-7",
        content: "Will this affect the current class schedules?",
        createdAt: new Date("2023-05-11T09:30:00Z"), // Use Date object
        author: users[1],
        upvotes: 3,
        downvotes: 0,
        userVote: null,
      },
    ],
  },
];