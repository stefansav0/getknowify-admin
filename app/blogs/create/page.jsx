"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Loader2, CheckCircle } from "lucide-react";

export default function CreateBlogPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    status: "draft",
    coverImage: "",
    content: "",
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Form to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use relative path for best compatibility with local/prod environments
      const response = await axios.post("https://www.getknowify.com/api/blogs", formData);

      if (response.data.success) {
        setSuccess(true);
        // Short delay so the user sees the success state before redirecting
        setTimeout(() => {
          router.push("/blogs");
        }, 1500);
      } else {
        setError(response.data.error || "Failed to create blog post.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Save Error:", err);
      setError(err.response?.data?.error || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/blogs" 
            className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
              Create New Post
            </h1>
            <p className="text-zinc-500 mt-1">Draft and publish a new article for your readers.</p>
          </div>
        </div>
      </div>

      {/* FEEDBACK MESSAGES */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 font-medium animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} />
          Post created successfully! Redirecting...
        </div>
      )}

      {/* FORM CONTAINER */}
      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-6 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* TITLE */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 ml-1">Post Title *</label>
            <input 
              type="text" 
              name="title"
              required
              disabled={success}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 10 Viral Quiz Ideas for 2026" 
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all text-lg font-medium" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AUTHOR */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Author Name *</label>
              <input 
                type="text" 
                name="author"
                required
                disabled={success}
                value={formData.author}
                onChange={handleChange}
                placeholder="Your Name" 
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all" 
              />
            </div>

            {/* STATUS */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Visibility Status</label>
              <select 
                name="status"
                disabled={success}
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="published">Published (Live on Website)</option>
              </select>
            </div>
          </div>

          {/* COVER IMAGE */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 ml-1">Cover Image URL</label>
            <input 
              type="url" 
              name="coverImage"
              disabled={success}
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/your-image-link" 
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all font-mono text-sm" 
            />
          </div>

          {/* CONTENT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-bold text-zinc-700">HTML Content *</label>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md font-bold">
                Rich Text / HTML Support
              </span>
            </div>
            <textarea 
              rows="15" 
              name="content"
              required
              disabled={success}
              value={formData.content}
              onChange={handleChange}
              placeholder="<h1>Start Writing...</h1><p>Your amazing content goes here.</p>" 
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-6 outline-none transition-all font-mono text-sm custom-scrollbar leading-relaxed"
            ></textarea>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-6 pt-6 border-t border-zinc-100">
            <Link 
              href="/blogs" 
              className="text-zinc-500 font-bold hover:text-zinc-800 transition-colors px-4"
            >
              Cancel
            </Link>
            
            <button 
              type="submit" 
              disabled={loading || success}
              className="flex items-center gap-3 bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-zinc-200 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Done!
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Post
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}