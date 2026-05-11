"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";

export default function EditBlogPage({ params }) {
  const router = useRouter();
  
  // Unwrap the params to get the SLUG safely in Next.js 14/15
  const { slug } = use(params);

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    status: "draft",
    coverImage: "",
    content: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DATA ON MOUNT
  // ==========================================
  useEffect(() => {
    fetchBlogData();
  }, [slug]);

  const fetchBlogData = async () => {
    try {
      setIsLoading(true);
      // Use relative path for Axios in client components
      const response = await axios.get(`https://www.getknowify.com/api/blogs/${slug}`);
      
      if (response.data.success) {
        const blog = response.data.blog;
        setFormData({
          title: blog.title || "",
          author: blog.author || "",
          status: blog.status || "draft",
          coverImage: blog.coverImage || "",
          content: blog.content || "",
        });
      } else {
        setError("Blog post not found.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load blog data. It may have been deleted.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await axios.put(`https://www.getknowify.com/api/blogs/${slug}`, formData);
      if (response.data.success) {
        // Redirect back to admin list on success
        router.push("/blogs"); 
      } else {
        setError(response.data.error || "Failed to update blog post.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      setError("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this post? This cannot be undone.");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(`https://www.getknowify.com/api/blogs/${slug}`);
      if (response.data.success) {
        router.push("/blogs");
      } else {
        setError(response.data.error || "Failed to delete blog post.");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      setError("An unexpected error occurred while deleting.");
      setIsDeleting(false);
    }
  };

  // ==========================================
  // LOADING UI
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading post data...</p>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/blogs" className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Edit Post</h1>
            <p className="text-zinc-500 mt-1 text-sm font-mono truncate max-w-[200px] sm:max-w-xs">
              Slug: {slug}
            </p>
          </div>
        </div>
        
        {/* DELETE BUTTON */}
        <button 
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
          className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl font-medium transition-colors border border-red-100 w-fit"
        >
          {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          {isDeleting ? "Deleting..." : "Delete Post"}
        </button>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-800">×</button>
        </div>
      )}

      {/* FORM CONTAINER */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Post Title *</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title" 
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Author Name *</label>
              <input 
                type="text" 
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                placeholder="Author Name" 
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Live)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Cover Image URL</label>
            <input 
              type="url" 
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg" 
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all font-mono text-sm" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-zinc-700">HTML Content *</label>
              <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md font-mono">Accepts HTML / Markdown</span>
            </div>
            <textarea 
              rows="15" 
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              placeholder="<h1>Main Heading</h1><p>Start writing your blog post here...</p>" 
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-4 outline-none transition-all font-mono text-sm custom-scrollbar"
            ></textarea>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-100">
            <Link 
              href="/dashboard/blogs" 
              className="px-6 py-3 text-zinc-600 font-medium hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            
            <button 
              type="submit" 
              disabled={isSaving || isDeleting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isSaving ? "Updating..." : "Update Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}