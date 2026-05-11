"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Edit, Trash2, Plus, Loader2, FileText } from "lucide-react";

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH ALL BLOGS ON MOUNT
  // ==========================================
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Fetches from your central API
      const response = await axios.get("https://getknowify.com/api/blogs");
      
      if (response.data.success) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE BLOG FUNCTION (BY SLUG)
  // ==========================================
  const handleDelete = async (slug) => {
    if (!slug) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete this post? This cannot be undone.");
    if (!confirmDelete) return;

    // Optimistic UI update: Remove it from the list immediately
    const previousBlogs = [...blogs];
    setBlogs(blogs.filter((blog) => blog.slug !== slug));

    try {
      const response = await axios.delete(`/api/blogs/${slug}`);
      
      if (!response.data.success) {
        // Revert if backend fails
        setBlogs(previousBlogs);
        alert(response.data.error || "Failed to delete the blog post.");
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      setBlogs(previousBlogs); // Revert the UI on network error
      alert("Error connecting to server. Please try again.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            Blog Management
          </h1>
          <p className="text-zinc-500 font-medium">
            Create, update, and manage your website's articles.
          </p>
        </div>
        
        <Link 
          href="/blogs/create" 
          className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 w-fit"
        >
          <Plus size={20} strokeWidth={3} />
          New Article
        </Link>
      </div>

      {/* BLOG POSTS TABLE */}
      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-50/50 border-b border-zinc-100">
              <tr>
                <th className="px-8 py-5 font-bold">Article Details</th>
                <th className="px-6 py-5 font-bold">Author</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right tracking-widest">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-50">
              {/* LOADING STATE */}
              {loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
                      <p className="text-zinc-400 font-bold animate-pulse">Syncing with database...</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* EMPTY STATE */}
              {!loading && blogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-zinc-100 p-4 rounded-full">
                         <FileText size={32} className="text-zinc-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-zinc-900 font-bold text-lg">No articles found</p>
                        <p className="text-zinc-400">Get started by creating your first blog post.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* DATA ROWS */}
              {!loading && blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-900 text-base group-hover:text-zinc-950 transition-colors">
                        {blog.title || "Untitled Post"}
                      </div>
                      <div className="text-zinc-400 text-xs font-mono">
                        /{blog.slug || "no-slug"}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase border border-zinc-200">
                        {blog.author?.substring(0, 2) || "U"}
                      </div>
                      <span className="text-zinc-600 font-semibold">{blog.author || "Unknown"}</span>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <span 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                        blog.status === "published" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}
                    >
                      {blog.status || "draft"}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      
                      {/* EDIT BY SLUG */}
                      <Link 
                        href={`/blogs/edit/${blog.slug}`} 
                        className="p-2.5 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 rounded-xl transition-all shadow-sm group/btn"
                        title="Edit Article"
                      >
                        <Edit size={18} className="group-hover/btn:scale-110 transition-transform" />
                      </Link>

                      {/* DELETE BY SLUG */}
                      <button 
                        onClick={() => handleDelete(blog.slug)}
                        className="p-2.5 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm group/btn"
                        title="Delete Article"
                      >
                        <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            
          </table>
        </div>
        
        {/* FOOTER INFO */}
        {!loading && blogs.length > 0 && (
          <div className="px-8 py-4 bg-zinc-50/50 border-t border-zinc-100 flex justify-between items-center text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
            <span>Total Articles: {blogs.length}</span>
            <span>Live Sync Active</span>
          </div>
        )}
      </div>
    </div>
  );
}