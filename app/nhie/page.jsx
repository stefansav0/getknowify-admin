"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";

export default function NHIEQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await axios.get("/api/nhie");
      setQuizzes(data || []);
    } catch (error) {
      console.log("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id) => {
    if (!confirm("Delete this NHIE quiz permanently?")) return;
    try {
      await axios.delete("/api/nhie", { data: { id } });
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.log("Delete Error:", error);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const title = quiz.quizTitle || "";
    const creator = quiz.creatorName || "";
    return title.toLowerCase().includes(search.toLowerCase()) || 
           creator.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div className="p-6">Loading NHIE Data...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold">Never Have I Ever Quizzes</h1>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by creator..."
            className="border rounded-xl pl-10 pr-4 py-3 w-full md:w-80 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="text-zinc-500">No NHIE games found.</div>
      ) : (
        <div className="space-y-6">
          {filteredQuizzes.map((quiz) => {
            const isExpanded = expandedQuiz === quiz._id;
            return (
              <div key={quiz._id} className="bg-white border shadow rounded-3xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{quiz.quizTitle}</h2>
                    <p className="text-zinc-500 mt-1">by {quiz.creatorName}</p>
                    <div className="flex gap-4 mt-4 text-sm text-zinc-600">
                      <p>👥 Total Attempts: {quiz.attempts?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setExpandedQuiz(isExpanded ? null : quiz._id)} className="border p-2 rounded-xl hover:bg-zinc-100">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button onClick={() => deleteQuiz(quiz._id)} className="text-red-500 border border-red-200 hover:bg-red-50 p-2 rounded-xl">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-bold mb-6">Confessions</h3>
                    <div className="space-y-4">
                      {quiz.questions?.map((q, index) => (
                        <div key={index} className="border rounded-2xl p-4 bg-zinc-50 flex justify-between items-center">
                          <p className="font-medium text-zinc-800">{q.statement}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.creatorAnswer === 'I Have' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            Creator: {q.creatorAnswer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}