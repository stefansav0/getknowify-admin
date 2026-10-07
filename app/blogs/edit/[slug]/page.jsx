"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  Search,
  AlertTriangle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Pilcrow,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Code2,
} from "lucide-react";

/* =========================================================
   RICH TEXT EDITOR
   ========================================================= */

function RichTextEditor({ value, onChange, disabled }) {
  const editorRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    if (!initializedRef.current) {
      editorRef.current.innerHTML = value || "";
      initializedRef.current = true;
    }
  }, [value]);

  const execCommand = (command, commandValue = null) => {
    if (!editorRef.current || disabled) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    handleInput();
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      execCommand("bold");
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      execCommand("italic");
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      execCommand("undo");
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      execCommand("redo");
    }
  };

  const insertLink = () => {
    if (disabled) return;
    const url = window.prompt("Enter the URL:", "https://");
    if (!url) return;
    execCommand("createLink", url);
  };

  const ToolbarButton = ({ icon: Icon, label, onClick }) => {
    return (
      <button
        type="button"
        title={label}
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Icon size={18} />
      </button>
    );
  };

  return (
    <div className="rounded-[2rem] border border-zinc-200 overflow-hidden bg-white shadow-sm">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-2 pr-3 border-r border-zinc-200">
          <ToolbarButton
            icon={Heading2}
            label="Heading 2"
            onClick={() => execCommand("formatBlock", "H2")}
          />
          <ToolbarButton
            icon={Pilcrow}
            label="Paragraph"
            onClick={() => execCommand("formatBlock", "P")}
          />
        </div>

        <div className="flex items-center gap-2 pr-3 border-r border-zinc-200">
          <ToolbarButton
            icon={List}
            label="Bullet List"
            onClick={() => execCommand("insertUnorderedList")}
          />
          <ToolbarButton
            icon={ListOrdered}
            label="Numbered List"
            onClick={() => execCommand("insertOrderedList")}
          />
        </div>

        <div className="flex items-center gap-2 pr-3 border-r border-zinc-200">
          <ToolbarButton
            icon={Bold}
            label="Bold"
            onClick={() => execCommand("bold")}
          />
          <ToolbarButton
            icon={Italic}
            label="Italic"
            onClick={() => execCommand("italic")}
          />
          <ToolbarButton
            icon={LinkIcon}
            label="Insert Link"
            onClick={insertLink}
          />
        </div>

        <div className="flex items-center gap-2">
          <ToolbarButton
            icon={Undo2}
            label="Undo"
            onClick={() => execCommand("undo")}
          />
          <ToolbarButton
            icon={Redo2}
            label="Redo"
            onClick={() => execCommand("redo")}
          />
        </div>
      </div>

      {/* EDITOR */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Start writing your article..."
        className="min-h-[500px] p-6 md:p-8 outline-none text-zinc-800 text-base leading-8 bg-white max-w-none focus:ring-4 focus:ring-blue-500/10"
      />

      {/* FOOTER */}
      <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Code2 size={14} />
          <span>Article content is saved as HTML.</span>
        </div>
        <div className="text-xs text-zinc-400">
          H2 · Paragraph · Bullets · Numbered List · Bold · Italic · Links
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EDIT BLOG PAGE
   ========================================================= */

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const originalSlug = params?.slug;

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

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await axios.get(
          `https://www.getknowify.com/api/blogs/${originalSlug}`
        );

        if (response.data.success) {
          const blog = response.data.blog;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (html) => {
    setFormData((prev) => ({ ...prev, content: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const plainText = formData.content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!plainText) {
      setError("Please add some article content.");
      setSaving(false);
      return;
    }

    try {
      const response = await axios.put(
        `https://www.getknowify.com/api/blogs/${originalSlug}`,
        formData
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/blogs");
        }, 1500);
      } else {
        setError(response.data.error || "Failed to update blog post.");
        setSaving(false);
      }
    } catch (err) {
      console.error("Save Error:", err);
      setError(
        err.response?.data?.error ||
          "An unexpected error occurred. Please try again."
      );
      setSaving(false);
    }
  };

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
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/blogs"
            className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
              Edit Post
            </h1>
            <p className="text-zinc-500 mt-1">
              Make changes to your existing article.
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 font-medium flex items-center gap-3">
          <CheckCircle size={20} />
          Post updated successfully! Redirecting...
        </div>
      )}

      {/* FORM */}
      <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-6 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* CORE INFORMATION */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-zinc-800 border-b border-zinc-100 pb-2">
              Core Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TITLE */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">
                  Post Title *
                </label>
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
                  <label className="text-sm font-bold text-zinc-700">
                    URL Slug *
                  </label>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                    <AlertTriangle size={12} />
                    Changing this might break SEO links
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
                <label className="text-sm font-bold text-zinc-700 ml-1">
                  Category *
                </label>
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
                <label className="text-sm font-bold text-zinc-700 ml-1">
                  Author Name *
                </label>
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
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">
                  Visibility Status
                </label>
                <select
                  name="status"
                  disabled={success || saving}
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="draft">Draft (Hidden from Public)</option>
                  <option value="published">
                    Published (Live on Website)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* SEO & DISCOVERY */}
          <div className="space-y-6 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
            <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
              <Search size={18} className="text-blue-600" />
              <h2 className="text-lg font-black text-blue-900">
                SEO & Discovery
              </h2>
            </div>

            {/* KEYWORDS */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">
                Focus Keywords
              </label>
              <input
                type="text"
                name="keywords"
                disabled={success || saving}
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g., viral Instagram quiz, friendship quiz, quiz ideas"
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 outline-none transition-all"
              />
            </div>

            {/* META DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-zinc-700">
                  Meta Description *
                </label>
                <span
                  className={`text-xs font-bold ${
                    formData.metaDescription?.length > 160
                      ? "text-red-500"
                      : "text-zinc-400"
                  }`}
                >
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
              />
            </div>
          </div>

          {/* ARTICLE CONTENT */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-zinc-800 border-b border-zinc-100 pb-2">
              Article Content
            </h2>

            {/* COVER IMAGE */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">
                Cover Image URL
              </label>
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

            {/* RICH TEXT EDITOR */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                <label className="text-sm font-bold text-zinc-700">
                  Article Content *
                </label>
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg font-bold w-fit">
                  HTML Saved Automatically
                </span>
              </div>

              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                disabled={success || saving}
              />

              <div className="text-xs text-zinc-400 px-1">
                Use <strong>H2</strong> for main sections, paragraphs for
                normal text, and bullet or numbered lists for examples and
                questions.
              </div>
            </div>
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