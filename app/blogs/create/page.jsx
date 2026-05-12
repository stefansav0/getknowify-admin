"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Loader2, CheckCircle, Search } from "lucide-react";

export default function CreateBlogPage() {
  const router = useRouter();

  // Form State - Now includes SEO & Meta fields
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "",
    category: "",
    keywords: "",
    metaDescription: "",
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
    
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // Auto-generate slug from title if title is being typed and slug is empty or matches previous title
      if (name === "title" && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))) {
        updatedData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      
      return updatedData;
    });
  };

  // Submit Form to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send the enriched formData containing SEO meta fields
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
            <p className="text-zinc-500 mt-1">Draft and publish a heavily optimized article.</p>
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
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* --- SECTION 1: CORE DETAILS --- */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-zinc-800 border-b border-zinc-100 pb-2">Core Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TITLE */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Post Title *</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  disabled={success}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., How to Reconnect With an Old Friend You Haven't Spoken to in Years" 
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all text-lg font-medium" 
                />
              </div>

              {/* SLUG */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">URL Slug *</label>
                <input 
                  type="text" 
                  name="slug"
                  required
                  disabled={success}
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g., how-to-reconnect-with-an-old-friend" 
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all font-mono text-sm" 
                />
              </div>

              {/* CATEGORY */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Category *</label>
                <input 
                  type="text" 
                  name="category"
                  required
                  disabled={success}
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Friendship Psychology" 
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all" 
                />
              </div>

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
          </div>

          {/* --- SECTION 2: SEO & METADATA --- */}
          <div className="space-y-6 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
            <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
              <Search size={18} className="text-blue-600" />
              <h2 className="text-lg font-black text-blue-900">SEO & Discovery</h2>
            </div>
            
            {/* KEYWORDS */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Focus Keywords</label>
              <input 
                type="text" 
                name="keywords"
                disabled={success}
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g., reconnecting with old friends, how to reach out, friendship fade (comma separated)" 
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all" 
              />
            </div>

            {/* META DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-zinc-700">Meta Description *</label>
                <span className={`text-xs font-bold ${formData.metaDescription.length > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                  {formData.metaDescription.length} / 160 chars
                </span>
              </div>
              <textarea 
                rows="3" 
                name="metaDescription"
                required
                disabled={success}
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="Thinking about an old friend you haven't spoken to in years? Overcome the awkwardness and learn exactly how to reach out..." 
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* --- SECTION 3: MEDIA & CONTENT --- */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-zinc-800 border-b border-zinc-100 pb-2">Article Content</h2>

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
          </div>

          {/* --- ACTIONS --- */}
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