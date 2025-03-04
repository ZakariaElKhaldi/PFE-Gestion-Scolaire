// src/components/CreatePost.tsx
import { useState } from "react";
import { Image, Link, PlusCircle, X } from "lucide-react";
import { currentUser } from "@/types/lib/data";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isPreviewingImage, setIsPreviewingImage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    console.log("Post created:", { title, content, imageUrl });
    
    // Reset form
    setTitle("");
    setContent("");
    setImageUrl("");
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setImageUrl("");
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-subtle p-4 md:p-6 mb-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="h-10 w-10 rounded-full"
        />
        {!isExpanded ? (
          <div
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            Create a post...
          </div>
        ) : (
          <div className="flex-1">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-3 text-lg font-medium border-b focus:outline-none focus:border-primary"
            />
          </div>
        )}
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="animate-fade-up">
          <textarea
            placeholder="What would you like to share?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 mb-4 min-h-[120px] text-gray-700 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            autoFocus
          />

          {imageUrl && (
            <div className="mb-4 relative">
              {isPreviewingImage ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-[300px] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPreviewingImage(false)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-gray-600 truncate flex-1">
                    {imageUrl.length > 50
                      ? `${imageUrl.substring(0, 50)}...`
                      : imageUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPreviewingImage(true)}
                    className="text-primary hover:text-primary-600 ml-2"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                type="button"
                className="flex items-center text-gray-500 hover:text-primary transition-colors p-2 rounded-md"
                onClick={() => {
                  const url = prompt("Enter image URL:");
                  if (url) setImageUrl(url);
                }}
              >
                <Image className="h-5 w-5 mr-1" />
                <span className="text-sm">Add Image</span>
              </button>
              <button
                type="button"
                className="flex items-center text-gray-500 hover:text-primary transition-colors p-2 rounded-md"
              >
                <Link className="h-5 w-5 mr-1" />
                <span className="text-sm">Add Link</span>
              </button>
            </div>

            <div className="space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
