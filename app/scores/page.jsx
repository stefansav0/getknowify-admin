"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  Search,
  Medal,
  Users,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ScoresPage() {
  const [groupedScores, setGroupedScores] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openQuiz, setOpenQuiz] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [scoresRes, quizzesRes] = await Promise.all([
        axios.get("/api/scores"),
        axios.get("/api/quizzes").catch(() => ({ data: [] })),
      ]);

      const rawScores = Array.isArray(scoresRes.data)
        ? scoresRes.data
        : scoresRes.data?.scores || [];

      const rawQuizzes = Array.isArray(quizzesRes.data)
        ? quizzesRes.data
        : quizzesRes.data?.quizzes || [];

      const quizMap = {};

      rawQuizzes.forEach((q) => {
        quizMap[q._id] = q.quizTitle;
      });

      const grouped = rawScores.reduce((acc, score) => {
        const key = score.quizId;

        if (!acc[key]) {
          acc[key] = {
            quizId: key,
            quizTitle: quizMap[key] || "Untitled Quiz",
            attempts: 0,
            scores: [],
          };
        }

        acc[key].attempts += 1;
        acc[key].scores.push(score);

        return acc;
      }, {});

      // SORT BY HIGHEST SCORE
      Object.values(grouped).forEach((group) => {
        group.scores.sort((a, b) => b.score - a.score);
      });

      setGroupedScores(grouped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = Object.values(groupedScores).filter((group) =>
    group.quizTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-zinc-900">
            Quiz Attempts
          </h1>
          <p className="text-zinc-500 mt-1">
            View all quiz attempts & leaderboard rankings
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-[350px]">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-zinc-400"
          />

          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full bg-white rounded-2xl border border-zinc-200 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredGroups.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
          <Trophy className="mx-auto text-zinc-300 mb-4" size={60} />
          <h2 className="text-2xl font-bold">No Attempts Found</h2>
        </div>
      )}

      {/* QUIZ DROPDOWNS */}
      <div className="space-y-5">
        {!loading &&
          filteredGroups.map((group) => {
            const isOpen = openQuiz === group.quizId;

            return (
              <div
                key={group.quizId}
                className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden"
              >
                {/* TOP BAR */}
                <button
                  onClick={() =>
                    setOpenQuiz(isOpen ? null : group.quizId)
                  }
                  className="w-full p-5 flex items-center justify-between hover:bg-zinc-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                      <Brain size={24} />
                    </div>

                    <div className="text-left">
                      <h2 className="text-xl md:text-2xl font-bold text-zinc-900">
                        {group.quizTitle}
                      </h2>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          <Users size={14} />
                          {group.attempts} Attempts
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isOpen ? (
                      <ChevronUp className="text-zinc-500" />
                    ) : (
                      <ChevronDown className="text-zinc-500" />
                    )}
                  </div>
                </button>

                {/* ATTEMPTS LIST */}
                {isOpen && (
                  <div className="border-t border-zinc-100 p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 bg-zinc-50">
                    {group.scores.map((score, index) => {
                      const accuracy = Math.round(
                        ((score.score || 0) /
                          (score.totalQuestions || 1)) *
                          100
                      );

                      return (
                        <div
                          key={score._id}
                          className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm hover:shadow-md transition"
                        >
                          {/* TOP */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-zinc-900">
                                {score.playerName}
                              </h3>

                              <p className="text-sm text-zinc-500 mt-1">
                                Rank #{index + 1}
                              </p>
                            </div>

                            <div
                              className={`p-3 rounded-2xl ${
                                index === 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              <Medal size={20} />
                            </div>
                          </div>

                          {/* SCORE */}
                          <div className="mb-4">
                            <p className="text-zinc-500 text-sm">
                              Final Score
                            </p>

                            <h1 className="text-4xl font-black text-zinc-900">
                              {score.score}
                              <span className="text-lg text-zinc-400 ml-1">
                                / {score.totalQuestions}
                              </span>
                            </h1>
                          </div>

                          {/* ACCURACY */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-zinc-500">
                                Accuracy
                              </span>

                              <span className="font-bold text-green-600">
                                {accuracy}%
                              </span>
                            </div>

                            <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                          </div>

                          {/* DATE */}
                          <div className="mt-5 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
                            {new Date(score.createdAt).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}