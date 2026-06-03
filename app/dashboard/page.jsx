"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Brain, Users, FileQuestion, Sparkles, Activity, Loader2, Calendar, Eye, Globe, LayoutTemplate, Timer } from "lucide-react";
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
  const [rawData, setRawData] = useState({
    letters: [],
    quizzes: [],
    scores: [],
    visits: [], 
  });

  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");
  const [customDates, setCustomDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [displayStats, setDisplayStats] = useState({
    visitorsCount: 0,
    lettersCount: 0,
    quizzesCount: 0,
    scoresCount: 0,
    uniqueUsers: 0,
    questionsCount: 0,
    chartData: [],
    recentQuizzes: [],
    topCountries: [],
    topPages: [], 
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [lettersRes, quizzesRes, scoresRes, visitsRes] = await Promise.all([
        axios.get("/api/letters").catch(() => ({ data: [] })),
        axios.get("/api/quizzes").catch(() => ({ data: [] })),
        axios.get("/api/scores").catch(() => ({ data: [] })),
        axios.get("/api/visits").catch(() => ({ data: [] })), 
      ]);

      setRawData({
        letters: Array.isArray(lettersRes.data) ? lettersRes.data : lettersRes.data?.letters || [],
        quizzes: Array.isArray(quizzesRes.data) ? quizzesRes.data : quizzesRes.data?.quizzes || [],
        scores: Array.isArray(scoresRes.data) ? scoresRes.data : scoresRes.data?.scores || [],
        visits: Array.isArray(visitsRes.data) ? visitsRes.data : visitsRes.data?.visits || [],
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    const now = new Date();
    let startDate = new Date(0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (dateFilter === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "7d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "30d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "custom") {
      startDate = new Date(customDates.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customDates.end);
      endDate.setHours(23, 59, 59, 999);
    }

    const inRange = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d >= startDate && d <= endDate;
    };

    const filteredLetters = rawData.letters.filter((l) => inRange(l.createdAt));
    const filteredQuizzes = rawData.quizzes.filter((q) => inRange(q.createdAt));
    const filteredScores = rawData.scores.filter((s) => inRange(s.createdAt));
    const filteredVisits = rawData.visits.filter((v) => inRange(v.createdAt));

    const uniqueUserNames = new Set(filteredScores.map(s => s.playerName?.toLowerCase()));

    // --- REAL VISITORS COUNT ---
    // Sum up the visitors from GA4 (since data is grouped by hour/page)
    const visitorsCount = filteredVisits.reduce((acc, v) => acc + (v.visitors || 0), 0);

    const questionsCount = filteredQuizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

    const recentQuizzes = [...filteredQuizzes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // --- REAL COUNTRY DATA AGGREGATION ---
    const countryMap = {};
    filteredVisits.forEach(v => {
      const country = v.country || "Unknown";
      // Add the visitor count, not just 1
      countryMap[country] = (countryMap[country] || 0) + (v.visitors || 0);
    });

    const topCountries = Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // --- REAL PAGE VIEWS & TIME AGGREGATION ---
    const pageMap = {};
    filteredVisits.forEach(v => {
      const page = v.pagePath || "Unknown";
      const title = v.pageTitle || page;
      
      // THE FIX: In our custom DB, every row is 1 view. 
      // We grab v.visitors (which defaults to 1 in our Mongoose model)
      const views = v.visitors || 1; 
      const time = v.timeSpent || 0; 
      
      if (!pageMap[page]) pageMap[page] = { views: 0, totalTime: 0 };
      
      pageMap[page].views += views;
      // Just add the time spent for this specific visit
      pageMap[page].totalTime += time;
    });

    const formatTime = (seconds) => {
      if (isNaN(seconds) || !isFinite(seconds) || seconds === 0) return "0m 00s";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}m ${s.toString().padStart(2, '0')}s`;
    };

    const topPages = Object.entries(pageMap)
      .map(([path, data]) => ({
        path,
        views: data.views,
        // Calculate average: total time / number of views
        avgTime: formatTime(data.views > 0 ? (data.totalTime / data.views) : 0)
      }))
      .sort((a, b) => b.views - a.views);

    // --- CHART LOGIC (Real Data Only) ---
    const chartData = [];
    
    if (dateFilter === "today") {
      for (let i = 0; i <= now.getHours(); i++) {
        const hourStr = `${i === 0 ? 12 : i > 12 ? i - 12 : i} ${i >= 12 ? 'PM' : 'AM'}`;
        
        const isSameHour = (dString) => {
          const d = new Date(dString);
          return d.getHours() === i && d.getDate() === now.getDate();
        };

        const hourScores = rawData.scores.filter(s => isSameHour(s.createdAt));
        const hourActiveUsers = new Set(hourScores.map(s => s.playerName?.toLowerCase())).size;
        
        // Sum visitors for this hour
        const hourVisits = rawData.visits
          .filter(v => isSameHour(v.createdAt))
          .reduce((sum, v) => sum + (v.visitors || 0), 0);

        chartData.push({
          name: hourStr,
          Visitors: hourVisits,
          ActiveUsers: hourActiveUsers,
          Quizzes: rawData.quizzes.filter(q => isSameHour(q.createdAt)).length,
          Letters: rawData.letters.filter(l => isSameHour(l.createdAt)).length,
        });
      }
    } else {
      let loopDate = new Date(startDate);
      
      if (dateFilter === "all") {
        const allDates = [...rawData.letters, ...rawData.quizzes, ...rawData.scores, ...rawData.visits]
          .map(i => new Date(i.createdAt).getTime())
          .filter(t => !isNaN(t));
        if (allDates.length > 0) {
          loopDate = new Date(Math.min(...allDates));
          loopDate.setHours(0,0,0,0);
        } else {
          loopDate = new Date(); 
        }
      }

      while (loopDate <= endDate && chartData.length < 365) { 
        const dateStr = loopDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        
        const isSameDay = (dString) => {
          const d = new Date(dString);
          return d.getDate() === loopDate.getDate() && d.getMonth() === loopDate.getMonth() && d.getFullYear() === loopDate.getFullYear();
        };

        const dayScores = rawData.scores.filter(s => isSameDay(s.createdAt));
        const dailyUniqueUsers = new Set(dayScores.map(s => s.playerName?.toLowerCase())).size;
        
        // Sum visitors for this day
        const dayVisits = rawData.visits
          .filter(v => isSameDay(v.createdAt))
          .reduce((sum, v) => sum + (v.visitors || 0), 0);

        chartData.push({
          name: dateStr,
          Visitors: dayVisits,
          ActiveUsers: dailyUniqueUsers,
          Quizzes: rawData.quizzes.filter(q => isSameDay(q.createdAt)).length,
          Letters: rawData.letters.filter(l => isSameDay(l.createdAt)).length,
        });

        loopDate.setDate(loopDate.getDate() + 1);
      }
    }

    setDisplayStats({
      visitorsCount,
      lettersCount: filteredLetters.length,
      quizzesCount: filteredQuizzes.length,
      scoresCount: filteredScores.length,
      uniqueUsers: uniqueUserNames.size,
      questionsCount,
      chartData,
      recentQuizzes,
      topCountries: topCountries.slice(0, 5), 
      topPages: topPages.slice(0, 5)
    });

  }, [rawData, dateFilter, customDates, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading all platform data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-zinc-50/50 min-h-screen">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-3xl border shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            Analytics Overview
          </h1>
          <p className="text-zinc-500">
            Analyze your platform's performance and visitor traffic.
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Visitors" subtitle="Website traffic" value={displayStats.visitorsCount} icon={Eye} color="emerald" />
        <StatCard title="Active Users" subtitle="Quiz players" value={displayStats.uniqueUsers} icon={Users} color="orange" />
        <StatCard title="Quizzes Created" subtitle="In selected period" value={displayStats.quizzesCount} icon={Brain} color="purple" />
        <StatCard title="Quiz Attempts" subtitle="Scores submitted" value={displayStats.scoresCount} icon={Sparkles} color="pink" />
        <StatCard title="Letters Created" subtitle="In selected period" value={displayStats.lettersCount} icon={Mail} color="blue" />
        <StatCard title="Total Questions" subtitle="Across quizzes" value={displayStats.questionsCount} icon={FileQuestion} color="zinc" />
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CHARTS & PAGE VIEWS */}
        <div className="col-span-1 xl:col-span-2 flex flex-col gap-6">
          
          {/* MAIN CHART */}
          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Platform Growth & Activity</CardTitle>
                  <CardDescription>
                    {dateFilter === "today" ? "Hourly breakdown of website traffic and actions" : "Daily breakdown of website traffic and actions"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4" style={{ width: '100%', height: 350, minWidth: 0, minHeight: 0 }}>
                <ResponsiveContainer width="99%" height="100%">
                  <AreaChart data={displayStats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" name="Website Visitors" dataKey="Visitors" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                    <Area type="monotone" name="Active Players" dataKey="ActiveUsers" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" name="Quizzes Created" dataKey="Quizzes" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorQuizzes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* TOP VISITED PAGES TABLE */}
          <Card className="rounded-3xl border-0 shadow-md bg-white">
  <CardHeader className="pb-3 border-b border-zinc-100">
    <div className="flex items-center gap-2">
      <LayoutTemplate className="w-5 h-5 text-blue-500" />
      <CardTitle className="text-xl">Top Visited Pages</CardTitle>
    </div>
    <CardDescription>See what content keeps users engaged</CardDescription>
  </CardHeader>
  <CardContent className="pt-4">
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-zinc-400 uppercase bg-zinc-50 rounded-lg">
          <tr>
            <th className="px-4 py-3 rounded-l-lg">Page Path</th>
            <th className="px-4 py-3 text-right">Views</th>
            <th className="px-4 py-3 text-right rounded-r-lg">Avg. Time on Page</th>
          </tr>
        </thead>
        <tbody>
          {displayStats.topPages.length > 0 ? (
            displayStats.topPages.map((page, idx) => (
              <tr key={idx} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                
                {/* UPDATED: Now shows Title and Path! */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-zinc-900 truncate max-w-[200px] mb-0.5">
                    {page.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-medium truncate max-w-[200px]">
                    {page.path}
                  </div>
                </td>

                <td className="px-4 py-3 text-right font-black text-zinc-900">
                  {page.views.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-zinc-500 flex items-center justify-end gap-1.5 h-full pt-4">
                  <Timer className="w-3.5 h-3.5 text-zinc-400" />
                  {page.avgTime}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-4 py-6 text-center text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                No page tracking data recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* COUNTRY DATA SECTION */}
          <Card className="rounded-3xl border-0 shadow-md bg-white flex flex-col">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-xl">Top Countries</CardTitle>
              </div>
              <CardDescription>Where your visitors are located</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {displayStats.topCountries.length > 0 ? (
                  displayStats.topCountries.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-zinc-400 w-4">{idx + 1}.</span>
                        <span className="text-sm font-semibold text-zinc-700 group-hover:text-emerald-600 transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-black bg-zinc-100 text-zinc-600 px-2 py-1 rounded-lg">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400 text-center py-4 border border-dashed border-zinc-200 bg-zinc-50/50 rounded-xl">No location data available.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* RECENT QUIZZES SECTION */}
          <Card className="rounded-3xl border-0 shadow-md bg-white flex flex-col flex-1">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <CardTitle className="text-xl">Filtered Quizzes</CardTitle>
              <CardDescription>Recently created in this period</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              <div className="space-y-3">
                {displayStats.recentQuizzes.length > 0 ? (
                  displayStats.recentQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="group flex flex-col gap-1 border border-zinc-100 rounded-2xl p-3 hover:border-blue-100 hover:bg-blue-50/50 transition-all cursor-default"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm text-zinc-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                          {quiz.quizTitle || "Untitled Quiz"}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-zinc-500 font-medium">
                          by {quiz.creatorName || "Unknown"}
                        </span>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider bg-zinc-100 px-2 py-1 rounded-md">
                          {dateFilter === "today" ? (
                            new Date(quiz.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                          ) : (
                            new Date(quiz.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 text-sm text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                    No quizzes found for this time range.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, subtitle, value, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    pink: "bg-pink-50 text-pink-600",
    green: "bg-green-50 text-green-600",
    emerald: "bg-emerald-50 text-emerald-600",
    zinc: "bg-zinc-100 text-zinc-600",
  };

  return (
    <Card className="rounded-3xl border-0 shadow-md bg-white hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 whitespace-nowrap">{title}</p>
            <p className="text-[10px] text-zinc-400 mb-2 whitespace-nowrap">{subtitle}</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 mt-1">
              {value.toLocaleString()}
            </h2>
          </div>
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}