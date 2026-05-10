"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Search } from "lucide-react";

export default function LettersPage() {
  const [letters, setLetters] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH LETTERS
  // ==========================================
  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const { data } = await axios.get("/api/letters");
      setLetters(data.letters || []);
    } catch (error) {
      console.log("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE LETTER
  // ==========================================
  const deleteLetter = async (id) => {
    // 1. Ask for confirmation before deleting
    const confirmDelete = window.confirm("Are you sure you want to delete this letter?");
    
    // If the user clicks "Cancel", stop the function here
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/letters/${id}`);

      // Remove from UI instantly
      setLetters((prev) => prev.filter((letter) => letter._id !== id));

      // 2. Show success message
      window.alert("Delete is successful!");
      
    } catch (error) {
      console.log("Delete Error:", error);
      window.alert("Something went wrong while deleting.");
    }
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================
  const filteredLetters = letters.filter((letter) => {
    return (
      letter.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      letter.recipientName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ==========================================
  // LOADING UI
  // ==========================================
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // ==========================================
  // PAGE UI
  // ==========================================
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Letters</h1>

        {/* SEARCH */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-xl pl-10 pr-4 py-2 w-full md:w-64 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredLetters.length === 0 ? (
        <div className="text-zinc-500">No letters found.</div>
      ) : (
        // LETTERS GRID
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLetters.map((letter) => (
            <div
              key={letter._id}
              className="bg-white rounded-2xl shadow border p-5"
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg">
                    {letter.senderName}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    to {letter.recipientName}
                  </p>
                </div>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => deleteLetter(letter._id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                  title="Delete letter"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* MESSAGE */}
              {/* 3. Removed 'line-clamp-5' and added 'whitespace-pre-wrap' to show full text and preserve line breaks */}
              <p className="text-zinc-600 mt-4 whitespace-pre-wrap">
                {letter.message}
              </p>

              {/* DATE */}
              <p className="text-xs text-zinc-400 mt-4">
                {new Date(letter.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}