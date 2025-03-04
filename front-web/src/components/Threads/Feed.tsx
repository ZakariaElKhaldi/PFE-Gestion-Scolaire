// src/components/Feed.tsx
import { useState } from "react";
import { posts } from "@/types/lib/data";
import Post from "@/components/Threads/Post";
import CreatePost from "@/components/Threads/CreatePost";
import { Filter, TrendingUp } from "lucide-react";

const Feed = () => {
  const [sortBy, setSortBy] = useState<"latest" | "trending">("latest");
  const [filter, setFilter] = useState<string | null>(null);

  // Filtered and sorted posts
  const filteredPosts = posts
    .filter((post) => {
      if (!filter) return true;
      return post.author.role === filter;
    })
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.upvotes - a.upvotes;
      }
    });

  const handleFilterClick = (newFilter: string | null) => {
    setFilter(newFilter === filter ? null : newFilter);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CreatePost />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1">
          <button
            className={`px-3 py-1.5 text-sm rounded-md flex items-center transition-all ${
              sortBy === "latest"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSortBy("latest")}
          >
            Latest
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md flex items-center transition-all ${
              sortBy === "trending"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSortBy("trending")}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </button>
        </div>

        <div className="relative group">
          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-all">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-elevated overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="p-2">
              <button
                className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === "admin"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleFilterClick("admin")}
              >
                Administration
              </button>
              <button
                className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === "teacher"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleFilterClick("teacher")}
              >
                Teachers
              </button>
              <button
                className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === "student"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleFilterClick("student")}
              >
                Students
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div>
          {filteredPosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-subtle">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No posts found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
