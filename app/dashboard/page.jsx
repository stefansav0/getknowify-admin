"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Brain, Users, FileQuestion, Sparkles, Activity, Loader2, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function DashboardPage() {
  // 1. RAW DATA STATE (Fetched once)
  const [rawData, setRawData] = useState({
    letters: [],
    quizzes: [],
    scores: [],
  });

  // 2. UI & FILTER STATE
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("7d"); // 'today', '7d', '30d', 'all', 'custom'
  const [customDates, setCustomDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // 3. CALCULATED DISPLAY STATE
  const [displayStats, setDisplayStats] = useState({
    lettersCount: 0,
    quizzesCount: 0,
    scoresCount: 0,
    uniqueUsers: 0,
    questionsCount: 0,
    chartData: [],
    recentQuizzes: [],
  });

  // ==========================================
  // INITIAL FETCH (Get everything)
  // ==========================================
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [lettersRes, quizzesRes, scoresRes] = await Promise.all([
        axios.get("/api/letters").catch(() => ({ data: [] })),
        axios.get("/api/quizzes").catch(() => ({ data: [] })),
        axios.get("/api/scores").catch(() => ({ data: [] })),
      ]);

      setRawData({
        letters: Array.isArray(lettersRes.data) ? lettersRes.data : lettersRes.data?.letters || [],
        quizzes: Array.isArray(quizzesRes.data) ? quizzesRes.data : quizzesRes.data?.quizzes || [],
        scores: Array.isArray(scoresRes.data) ? scoresRes.data : scoresRes.data?.scores || [],
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PROCESS DATA WHEN FILTER CHANGES
  // ==========================================
  useEffect(() => {
    if (loading) return;

    const now = new Date();
    let startDate = new Date(0); // Default to beginning of time
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Determine Start Date based on filter
    if (dateFilter === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (dateFilter === "7d") {
      startDate = new Date(now.setDate(now.getDate() - 7));
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "30d") {
      startDate = new Date(now.setDate(now.getDate() - 30));
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "custom") {
      startDate = new Date(customDates.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customDates.end);
      endDate.setHours(23, 59, 59, 999);
    }

    // Helper to check if item is in range
    const inRange = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d >= startDate && d <= endDate;
    };

    // Filter Arrays
    const filteredLetters = rawData.letters.filter((l) => inRange(l.createdAt));
    const filteredQuizzes = rawData.quizzes.filter((q) => inRange(q.createdAt));
    const filteredScores = rawData.scores.filter((s) => inRange(s.createdAt));

    // Calculate Unique Users (Players) in this period
    const uniqueUserNames = new Set(filteredScores.map(s => s.playerName?.toLowerCase()));

    // Total Questions in filtered quizzes
    const questionsCount = filteredQuizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

    // Recent Quizzes for sidebar
    const recentQuizzes = [...filteredQuizzes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    // Build Chart Data (Group by Day)
    // To ensure continuous lines, we create an array of days from start to end
    const chartData = [];
    let loopDate = new Date(startDate);
    
    // Safety check: if "all time", limit chart to the oldest item's date or max 90 days to avoid freezing
    if (dateFilter === "all") {
      const allDates = [...rawData.letters, ...rawData.quizzes, ...rawData.scores]
        .map(i => new Date(i.createdAt).getTime())
        .filter(t => !isNaN(t));
      if (allDates.length > 0) {
        loopDate = new Date(Math.min(...allDates));
        loopDate.setHours(0,0,0,0);
      } else {
        loopDate = new Date(); // fallback
      }
    }

    while (loopDate <= endDate && chartData.length < 365) { // max 365 points for safety
      const dateStr = loopDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const isSameDay = (dString) => {
        const d = new Date(dString);
        return d.getDate() === loopDate.getDate() && d.getMonth() === loopDate.getMonth() && d.getFullYear() === loopDate.getFullYear();
      };

      const dayScores = rawData.scores.filter(s => isSameDay(s.createdAt));
      const dailyUniqueUsers = new Set(dayScores.map(s => s.playerName?.toLowerCase())).size;

      chartData.push({
        name: dateStr,
        Letters: rawData.letters.filter(l => isSameDay(l.createdAt)).length,
        Quizzes: rawData.quizzes.filter(q => isSameDay(q.createdAt)).length,
        ActiveUsers: dailyUniqueUsers,
      });

      loopDate.setDate(loopDate.getDate() + 1);
    }

    // Update state
    setDisplayStats({
      lettersCount: filteredLetters.length,
      quizzesCount: filteredQuizzes.length,
      scoresCount: filteredScores.length,
      uniqueUsers: uniqueUserNames.size,
      questionsCount,
      chartData,
      recentQuizzes,
    });

  }, [rawData, dateFilter, customDates, loading]);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading all platform data...</p>
      </div>
    );
  }

  // ==========================================
  // UI RENDER
  // ==========================================
  return (
    <div className="p-4 md:p-8 space-y-8 bg-zinc-50/50 min-h-screen">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-3xl border shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            Analytics Overview
          </h1>
          <p className="text-zinc-500">
            Analyze your platform's performance based on specific timeframes.
          </p>
        </div>

        {/* DATE CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48 appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 font-medium cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-blue-500 block p-2.5"
              />
              <span className="text-zinc-400">to</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-blue-500 block p-2.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatCard title="Active Users" subtitle="Unique players" value={displayStats.uniqueUsers} icon={Users} color="orange" />
        <StatCard title="Quizzes Created" subtitle="In selected period" value={displayStats.quizzesCount} icon={Brain} color="purple" />
        <StatCard title="Quiz Attempts" subtitle="Total scores submitted" value={displayStats.scoresCount} icon={Sparkles} color="pink" />
        <StatCard title="Letters Created" subtitle="In selected period" value={displayStats.lettersCount} icon={Mail} color="blue" />
        <StatCard title="Total Questions" subtitle="Across quizzes" value={displayStats.questionsCount} icon={FileQuestion} color="green" />
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <Card className="col-span-1 lg:col-span-2 rounded-3xl border-0 shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Platform Growth & Activity</CardTitle>
                <CardDescription>Visualizing user visits (active players) vs content creation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayStats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLetters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" name="Active Users/Visitors" dataKey="ActiveUsers" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" name="Quizzes Created" dataKey="Quizzes" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorQuizzes)" />
                  <Area type="monotone" name="Letters Created" dataKey="Letters" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorLetters)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RECENT QUIZZES SECTION */}
        <Card className="col-span-1 rounded-3xl border-0 shadow-md bg-white flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Filtered Quizzes</CardTitle>
            <CardDescription>Recently created in this period</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <div className="space-y-4">
              {displayStats.recentQuizzes.length > 0 ? (
                displayStats.recentQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="group flex flex-col gap-1 border border-zinc-100 rounded-2xl p-4 hover:border-blue-100 hover:shadow-sm hover:bg-blue-50/50 transition-all cursor-default"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {quiz.quizTitle || "Untitled Quiz"}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-zinc-500 font-medium text-xs">
                        by {quiz.creatorName || "Unknown"}
                      </span>
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider bg-zinc-100 px-2 py-1 rounded-md">
                        {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-zinc-400 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                  No quizzes found for this date range.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ==========================================
// REUSABLE STAT CARD COMPONENT
// ==========================================
function StatCard({ title, subtitle, value, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    pink: "bg-pink-50 text-pink-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <Card className="rounded-3xl border-0 shadow-md bg-white hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-500">{title}</p>
            <p className="text-[11px] text-zinc-400 mb-2">{subtitle}</p>
            <h2 className="text-4xl font-black tracking-tight text-zinc-900">
              {value.toLocaleString()}
            </h2>
          </div>
          <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}