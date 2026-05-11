"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trophy, Search, Medal, Users, Brain, Hash } from "lucide-react";

export default function ScoresPage() {
  const [groupedScores, setGroupedScores] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH SCORES & QUIZZES
  // ==========================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both scores and quizzes simultaneously
      const [scoresRes, quizzesRes] = await Promise.all([
        axios.get("/api/scores"),
        // Catch error in case the quizzes endpoint fails, so it doesn't break the whole page
        axios.get("/api/quizzes").catch(() => ({ data: [] })),
      ]);

      // FIX: Check if the data itself is a direct array, otherwise look for the .scores property
      const rawScores = Array.isArray(scoresRes.data) 
        ? scoresRes.data 
        : scoresRes.data?.scores || [];
        
      const rawQuizzes = Array.isArray(quizzesRes.data) 
        ? quizzesRes.data 
        : quizzesRes.data?.quizzes || [];

      // Create a map to quickly find Quiz Titles by their ID
      const quizMap = {};
      rawQuizzes.forEach((q) => {
        quizMap[q._id] = q.quizTitle;
      });

      // Group the scores by Quiz ID
      const grouped = rawScores.reduce((acc, score) => {
        const key = score.quizId;
        
        // If this quiz isn't in our grouped object yet, add it
        if (!acc[key]) {
          acc[key] = {
            quizId: key,
            quizTitle: quizMap[key] || "Untitled Quiz", 
            attempts: 0,
            scores: [],
          };
        }

        // Increment attempts and push the score into this group
        acc[key].attempts += 1;
        acc[key].scores.push(score);
        
        return acc;
      }, {});

      setGroupedScores(grouped);
    } catch (error) {
      console.error("Error fetching data:", error);
      setGroupedScores({});
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SEARCH FILTERING
  // ==========================================
  // Convert object to array and filter based on search input
  const filteredGroups = Object.values(groupedScores)
    .map((group) => {
      const searchLower = search.toLowerCase();

      // Check if the search matches the Quiz Title or Quiz ID
      const matchesQuiz =
        group.quizTitle.toLowerCase().includes(searchLower) ||
        group.quizId.toLowerCase().includes(searchLower);

      // Filter the specific player scores inside the group
      const matchingScores = group.scores.filter((s) =>
        s.playerName?.toLowerCase().includes(searchLower)
      );

      // If the quiz title matches, show all scores in that quiz.
      // If a specific player matches, show only that player's score.
      if (matchesQuiz) {
        return group;
      } else if (matchingScores.length > 0) {
        return { ...group, scores: matchingScores };
      }
      
      return null;
    })
    .filter(Boolean); // Remove null values

  // ==========================================
  // UI RENDER
  // ==========================================
  return (
    <div className="p-4 md:p-6 min-h-screen bg-zinc-50/50">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Leaderboards</h1>
          <p className="text-zinc-500 mt-1">View player attempts grouped by Quiz</p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-[320px]">
          <Search size={18} className="absolute left-4 top-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search player or quiz title..."
            className="w-full border-0 shadow-sm bg-white rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium animate-pulse">Organizing scores...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredGroups.length === 0 && (
        <div className="bg-white rounded-3xl border shadow-sm p-12 text-center max-w-lg mx-auto mt-10">
          <Trophy size={60} className="mx-auto text-zinc-200 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900">No Scores Found</h2>
          <p className="text-zinc-500 mt-2">No attempts match your current search criteria.</p>
        </div>
      )}

      {/* SCORES GROUPED BY QUIZ */}
      {!loading && filteredGroups.length > 0 && (
        <div className="space-y-12">
          {filteredGroups.map((group) => (
            <div key={group.quizId} className="space-y-4">
              
              {/* QUIZ SECTION HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h2 className="text-2xl font-bold text-zinc-900">{group.quizTitle}</h2>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-zinc-500 font-mono bg-zinc-100 px-2 py-1 rounded-md w-fit">
                    <Hash size={14} />
                    {group.quizId}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                  <Users size={18} />
                  <span className="font-semibold text-sm">{group.attempts} Total Attempts</span>
                </div>
              </div>

              {/* PLAYER CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-2">
                {group.scores.map((score, index) => {
                  const accuracy = Math.round(
                    ((score.score || 0) / (score.totalQuestions || 1)) * 100
                  );

                  return (
                    <div
                      key={score._id}
                      className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      {/* Top Rank Badge styling for 1st place */}
                      {index === 0 && search === "" && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold break-words text-zinc-900">
                            {score.playerName || "Unknown Player"}
                          </h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${index === 0 && search === "" ? "bg-yellow-100 text-yellow-700" : "bg-zinc-100 text-zinc-500"}`}>
                          <Medal size={22} />
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-zinc-500 text-sm font-medium">Final Score</p>
                        <h4 className="text-4xl font-extrabold mt-1 text-zinc-900">
                          {score.score}
                          <span className="text-lg text-zinc-400 font-medium ml-1">
                            / {score.totalQuestions}
                          </span>
                        </h4>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-zinc-500 font-medium">Accuracy</span>
                          <span className={`font-bold ${accuracy >= 80 ? "text-green-600" : accuracy >= 50 ? "text-orange-500" : "text-red-500"}`}>
                            {accuracy}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${accuracy >= 80 ? "bg-green-500" : accuracy >= 50 ? "bg-orange-400" : "bg-red-500"}`}
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-6 pt-4 border-t border-zinc-100">
                        <span className="font-medium px-2 py-1 bg-zinc-50 rounded-md">
                          Rank #{index + 1}
                        </span>
                        <span>
                          {new Date(score.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}