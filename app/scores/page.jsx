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
  Clock,
  Filter,
  Calendar,
  Sparkles,
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

      // Parallel fetching for performance
      const [scoresRes, quizzesRes] = await Promise.all([
        axios.get("/api/scores"),
        axios.get("/api/quizzes").catch(() => ({ data: [] })),
      ]);

      // Safe extraction of data
      const rawScores = scoresRes?.data?.scores || scoresRes?.data || [];
      const rawQuizzes = quizzesRes?.data?.quizzes || quizzesRes?.data || [];

      // Create a map for fast quiz title lookup
      const quizMap = rawQuizzes.reduce((acc, q) => {
        acc[q._id] = q.quizTitle;
        return acc;
      }, {});

      // Group scores by Quiz ID
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

      // SORT BY TIME (NEWEST FIRST) - As requested
      Object.values(grouped).forEach((group) => {
        group.scores.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      });

      setGroupedScores(grouped);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = Object.values(groupedScores).filter((group) =>
    group.quizTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-2">
              <Sparkles size={14} />
              Leaderboard
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Quiz Attempts
            </h1>
            <p className="text-slate-500 text-lg max-w-xl">
              Track participant performance and view recent attempts across all your quizzes.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-[400px] group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search quizzes..."
              className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* STATS ROW (Optional polish) */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Brain size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Quizzes</p>
                <p className="text-2xl font-bold text-slate-900">{filteredGroups.length}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Attempts</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.values(groupedScores).reduce((acc, curr) => acc + curr.attempts, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
        
        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-3xl w-full" />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Trophy className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No quizzes found</h3>
            <p className="text-slate-500 max-w-md">
              {search ? "Try adjusting your search terms." : "It looks like there are no quiz attempts yet."}
            </p>
          </div>
        )}

        {/* QUIZ DROPDOWNS */}
        <div className="space-y-6">
          {!loading &&
            filteredGroups.map((group) => {
              const isOpen = openQuiz === group.quizId;
              
              return (
                <div
                  key={group.quizId}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md"
                >
                  {/* HEADER / TOGGLE */}
                  <button
                    onClick={() => setOpenQuiz(isOpen ? null : group.quizId)}
                    className="w-full p-6 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-5">
                      <div className="hidden md:flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Brain size={24} />
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-slate-900">
                          {group.quizTitle}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            <Users size={12} />
                            {group.attempts} Attempts
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            <Clock size={12} />
                            Sorted by Recent
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  {/* DROPDOWN CONTENT */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="border-t border-slate-100 p-6 bg-slate-50/50">
                      
                      {/* SUB-HEADER FOR LIST */}
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                          Recent Attempts
                        </h3>
                        <div className="flex gap-2">
                           {/* Optional Filter Icon */}
                           <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                             <Filter size={16} />
                           </button>
                        </div>
                      </div>

                      {/* GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {group.scores.map((score, index) => {
                          const accuracy = Math.round(
                            ((score.score || 0) / (score.totalQuestions || 1)) * 100
                          );
                          
                          // Determine styling based on rank
                          const isTop3 = index < 3;
                          const rankColor = index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-700" : "text-slate-500";
                          const rankBg = index === 0 ? "bg-amber-50 border-amber-100" : "bg-white border-slate-100";

                          return (
                            <div
                              key={score._id}
                              className={`relative group rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${rankBg} border-slate-100`}
                            >
                              {/* RANK BADGE */}
                              <div className="absolute -top-3 left-4 flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-bold text-slate-600">
                                <Trophy size={12} className={rankColor} />
                                #{index + 1}
                              </div>

                              <div className="mt-2 flex justify-between items-start">
                                <div>
                                  <h4 className="text-lg font-bold text-slate-900 truncate max-w-[180px]">
                                    {score.playerName}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                                    <Calendar size={12} />
                                    {new Date(score.createdAt).toLocaleDateString(undefined, {
                                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                
                                {/* SCORE DISPLAY */}
                                <div className="text-right">
                                  <span className="text-3xl font-black text-slate-800">
                                    {score.score}
                                  </span>
                                  <span className="text-sm text-slate-400 font-medium">
                                    /{score.totalQuestions}
                                  </span>
                                </div>
                              </div>

                              {/* ACCURACY BAR */}
                              <div className="mt-5">
                                <div className="flex justify-between items-end mb-1.5">
                                  <span className="text-xs font-medium text-slate-500">Accuracy</span>
                                  <span className={`text-xs font-bold ${
                                    accuracy >= 80 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-500'
                                  }`}>
                                    {accuracy}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      accuracy >= 80 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                                    }`}
                                    style={{ width: `${accuracy}%` }} 
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}