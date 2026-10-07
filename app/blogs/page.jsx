"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  FileText,
  Eye,
  Search,
  ArrowLeft,
  X,
} from "lucide-react";

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // SEARCH + FILTER STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "published" | "draft"

  // ==========================================
  // FETCH ALL BLOGS ON MOUNT
  // ==========================================
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://www.getknowify.com/api/blogs");

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

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This cannot be undone."
    );
    if (!confirmDelete) return;

    // Optimistic UI update
    const previousBlogs = [...blogs];
    setBlogs(blogs.filter((blog) => blog.slug !== slug));

    try {
      const response = await axios.delete(
        `https://www.getknowify.com/api/blogs/${slug}`
      );

      if (!response.data.success) {
        setBlogs(previousBlogs);
        alert(response.data.error || "Failed to delete the blog post.");
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      setBlogs(previousBlogs);
      alert("Error connecting to server. Please try again.");
    }
  };

  // ==========================================
  // COUNTS FOR TABS
  // ==========================================
  const counts = useMemo(() => {
    const published = blogs.filter((b) => b.status === "published").length;
    const draft = blogs.filter((b) => b.status !== "published").length;
    return {
      all: blogs.length,
      published,
      draft,
    };
  }, [blogs]);

  // ==========================================
  // FILTERED + SEARCHED BLOGS
  // ==========================================
  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return blogs.filter((blog) => {
      // 1. Status filter
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "published"
          ? blog.status === "published"
          : blog.status !== "published"; // draft (anything not published)

      if (!matchesFilter) return false;

      // 2. Search filter
      if (!query) return true;

      const title = (blog.title || "").toLowerCase();
      const slug = (blog.slug || "").toLowerCase();
      const author = (blog.author || "").toLowerCase();

      return (
        title.includes(query) ||
        slug.includes(query) ||
        author.includes(query)
      );
    });
  }, [blogs, searchQuery, activeFilter]);

  // ==========================================
  // TAB CONFIG
  // ==========================================
  const tabs = [
    { key: "all", label: "All Posts", count: counts.all },
    { key: "published", label: "Published", count: counts.published },
    { key: "draft", label: "Drafts", count: counts.draft },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ========================================== */}
      {/* BACK TO DASHBOARD NAVIGATION */}
      {/* ========================================== */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors group w-fit"
      >
        <span className="p-1.5 rounded-lg bg-white border border-zinc-200 group-hover:border-zinc-900 transition-all shadow-sm">
          <ArrowLeft size={16} strokeWidth={2.5} />
        </span>
        Back to Dashboard
      </Link>

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

      {/* ========================================== */}
      {/* SEARCH + FILTER BAR */}
      {/* ========================================== */}
      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/40 p-4 md:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, or author..."
              className="w-full pl-11 pr-11 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE SEARCH SUMMARY */}
        {searchQuery && !loading && (
          <p className="text-xs font-bold text-zinc-400 px-1">
            Showing{" "}
            <span className="text-zinc-900">{filteredBlogs.length}</span>{" "}
            result{filteredBlogs.length !== 1 ? "s" : ""} for "
            <span className="text-zinc-900">{searchQuery}</span>"
          </p>
        )}
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
                <th className="px-6 py-5 font-bold">Views</th>
                <th className="px-6 py-5 font-bold text-right tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-50">
              {/* LOADING STATE */}
              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
                      <p className="text-zinc-400 font-bold animate-pulse">
                        Syncing with database...
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* EMPTY STATE */}
              {!loading && filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-zinc-100 p-4 rounded-full">
                        <FileText size={32} className="text-zinc-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-zinc-900 font-bold text-lg">
                          {blogs.length === 0
                            ? "No articles found"
                            : "No matching articles"}
                        </p>
                        <p className="text-zinc-400">
                          {blogs.length === 0
                            ? "Get started by creating your first blog post."
                            : "Try adjusting your search or filter to find what you're looking for."}
                        </p>
                      </div>

                      {/* RESET FILTERS BUTTON */}
                      {blogs.length > 0 &&
                        (searchQuery || activeFilter !== "all") && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setActiveFilter("all");
                            }}
                            className="mt-2 px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                          >
                            Reset Filters
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              )}

              {/* DATA ROWS */}
              {!loading &&
                filteredBlogs.map((blog) => (
                  <tr
                    key={blog._id}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
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
                        <span className="text-zinc-600 font-semibold">
                          {blog.author || "Unknown"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                          blog.status === "published"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {blog.status || "draft"}
                      </span>
                    </td>

                    <td className="px-6 py-6 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span className="text-sm font-bold">
                          {blog.views || 0}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* EDIT BY SLUG */}
                        <Link
                          href={`/blogs/edit/${blog.slug}`}
                          className="p-2.5 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 rounded-xl transition-all shadow-sm group/btn"
                          title="Edit Article"
                        >
                          <Edit
                            size={18}
                            className="group-hover/btn:scale-110 transition-transform"
                          />
                        </Link>

                        {/* DELETE BY SLUG */}
                        <button
                          onClick={() => handleDelete(blog.slug)}
                          className="p-2.5 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm group/btn"
                          title="Delete Article"
                        >
                          <Trash2
                            size={18}
                            className="group-hover/btn:scale-110 transition-transform"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER INFO */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="px-8 py-4 bg-zinc-50/50 border-t border-zinc-100 flex flex-wrap gap-2 justify-between items-center text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
            <span>
              Showing: {filteredBlogs.length} / {blogs.length} Articles
            </span>
            <span>Live Sync Active</span>
          </div>
        )}
      </div>
    </div>
  );
}