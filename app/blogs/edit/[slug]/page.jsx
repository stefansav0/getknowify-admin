"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Loader2, CheckCircle, Search, AlertTriangle } from "lucide-react";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams(); // Grabs the dynamic [slug] from the URL
  const originalSlug = params?.slug;

  // Form State
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

  // UI States
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🚀 FETCH EXISTING POST DATA ON MOUNT
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        // Fetch via your dynamic GET route
        const response = await axios.get(`/api/blogs/${originalSlug}`);
        
        if (response.data.success) {
          const blog = response.data.blog;
          // Pre-fill the form with existing database values
          setFormData({
            title: blog.title || "",
            slug: blog.slug || "",
            author: blog.author || "",
            category: blog.category || "",
            keywords: blog.keywords || "",
            metaDescription: blog.metaDescription || "",
            status: blog.status || "draft",
            coverImage: blog.coverImage || "",
            content: blog.content || "",
          });
        } else {
          setError("Failed to load blog data.");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Article not found or server error.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (originalSlug) {
      fetchBlogData();
    }
  }, [originalSlug]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Form to Backend (PUT Request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Send the updated data to your dynamic PUT route
      const response = await axios.put(`/api/blogs/${originalSlug}`, formData);

      if (response.data.success) {
        setSuccess(true);
        // Short delay so the user sees the success state before redirecting
        setTimeout(() => {
          router.push("/blogs"); // or /dashboard/blogs depending on your routing
        }, 1500);
      } else {
        setError(response.data.error || "Failed to update blog post.");
        setSaving(false);
      }
    } catch (err) {
      console.error("Save Error:", err);
      // Handles the Duplicate Slug error we built into the backend!
      setError(err.response?.data?.error || "An unexpected error occurred. Please try again.");
      setSaving(false);
    }
  };

  // ⏳ INITIAL LOADING STATE UI
  if (initialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-zinc-500 bg-zinc-50">
        <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
        <p className="font-bold tracking-wide">Loading article data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/blogs" // Update this link to match your dashboard URL
            className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
              Edit Post
            </h1>
            <p className="text-zinc-500 mt-1">Make changes to your existing article.</p>
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
          Post updated successfully! Redirecting...
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
                  disabled={success || saving}
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all text-lg font-medium" 
                />
              </div>

              {/* SLUG */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between ml-1">
                   <label className="text-sm font-bold text-zinc-700">URL Slug *</label>
                   <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                     <AlertTriangle size={12} /> Changing this might break SEO links
                   </span>
                </div>
                <input 
                  type="text" 
                  name="slug"
                  required
                  disabled={success || saving}
                  value={formData.slug}
                  onChange={handleChange}
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
                  disabled={success || saving}
                  value={formData.category}
                  onChange={handleChange}
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
                  disabled={success || saving}
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all" 
                />
              </div>

              {/* STATUS */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-bold text-zinc-700 ml-1">Visibility Status</label>
                <select 
                  name="status"
                  disabled={success || saving}
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
                disabled={success || saving}
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g., reconnecting with old friends, how to reach out (comma separated)" 
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all" 
              />
            </div>

            {/* META DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-zinc-700">Meta Description *</label>
                <span className={`text-xs font-bold ${formData.metaDescription?.length > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                  {formData.metaDescription?.length || 0} / 160 chars
                </span>
              </div>
              <textarea 
                rows="3" 
                name="metaDescription"
                required
                disabled={success || saving}
                value={formData.metaDescription}
                onChange={handleChange}
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
                disabled={success || saving}
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
                disabled={success || saving}
                value={formData.content}
                onChange={handleChange}
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
              disabled={saving || success}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Updating...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Done!
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Post
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}