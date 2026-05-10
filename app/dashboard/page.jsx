"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Brain, FileQuestion, Sparkles, Clock3, Activity, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLetters: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    todayLetters: 0,
    todayQuizzes: 0,
    recentQuizzes: [],
    chartData: [],
  });

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [lettersRes, quizzesRes] = await Promise.all([
        axios.get("/api/letters"),
        axios.get("/api/quizzes"),
      ]);

      const letters = lettersRes.data?.letters || [];
      const quizzes = quizzesRes.data?.quizzes || quizzesRes.data || [];

      // ==========================================
      // DATE HELPERS
      // ==========================================
      const today = new Date();
      const isToday = (date) => {
        if (!date) return false;
        const d = new Date(date);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      };

      // ==========================================
      // COUNTS & AGGREGATIONS
      // ==========================================
      const todayLetters = letters.filter((l) => isToday(l.createdAt)).length;
      const todayQuizzes = quizzes.filter((q) => isToday(q.createdAt)).length;

      const totalQuestions = quizzes.reduce((acc, quiz) => {
        return acc + (quiz.questions?.length || 0);
      }, 0);

      const recentQuizzes = [...quizzes]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // ==========================================
      // GENERATE 7-DAY CHART DATA
      // ==========================================
      const generateChartData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          const isSameDay = (itemDate) => {
            if (!itemDate) return false;
            const id = new Date(itemDate);
            return (
              id.getDate() === d.getDate() &&
              id.getMonth() === d.getMonth() &&
              id.getFullYear() === d.getFullYear()
            );
          };

          data.push({
            name: dateString,
            Letters: letters.filter((l) => isSameDay(l.createdAt)).length,
            Quizzes: quizzes.filter((q) => isSameDay(q.createdAt)).length,
          });
        }
        return data;
      };

      // ==========================================
      // SET STATS
      // ==========================================
      setStats({
        totalLetters: letters.length,
        totalQuizzes: quizzes.length,
        totalQuestions,
        todayLetters,
        todayQuizzes,
        recentQuizzes,
        chartData: generateChartData(),
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading your insights...</p>
      </div>
    );
  }

  // ==========================================
  // UI RENDER
  // ==========================================
  return (
    <div className="p-4 md:p-8 space-y-8 bg-zinc-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500 text-lg">
          Welcome back to the GetKnowify Admin Panel. Here is what is happening today.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatCard title="Total Letters" value={stats.totalLetters} icon={Mail} color="blue" />
        <StatCard title="New Today" value={stats.todayLetters} icon={Sparkles} color="orange" />
        <StatCard title="Total Quizzes" value={stats.totalQuizzes} icon={Brain} color="purple" />
        <StatCard title="Quiz Today" value={stats.todayQuizzes} icon={Clock3} color="pink" />
        <StatCard title="Questions" value={stats.totalQuestions} icon={FileQuestion} color="green" />
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION (Takes 2 columns) */}
        <Card className="col-span-1 lg:col-span-2 rounded-3xl border-0 shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Activity Over Time</CardTitle>
                <CardDescription>Letters and Quizzes created in the last 7 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLetters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="Quizzes" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorQuizzes)" />
                  <Area type="monotone" dataKey="Letters" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorLetters)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RECENT QUIZZES SECTION (Takes 1 column) */}
        <Card className="col-span-1 rounded-3xl border-0 shadow-md bg-white flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Recent Quizzes</CardTitle>
            <CardDescription>Latest activity from your creators</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {stats.recentQuizzes.length > 0 ? (
                stats.recentQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="group flex flex-col gap-1 border border-zinc-100 rounded-2xl p-4 hover:border-zinc-200 hover:shadow-sm hover:bg-zinc-50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {quiz.quizTitle || "Untitled Quiz"}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-zinc-500 font-medium">
                        by {quiz.creatorName || "Unknown"}
                      </span>
                      <span className="text-zinc-400 text-xs bg-zinc-100 px-2 py-1 rounded-md">
                        {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-zinc-500 bg-zinc-50 rounded-2xl border border-dashed">
                  No recent quizzes found.
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
function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <Card className="rounded-3xl border-0 shadow-md bg-white hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">{title}</p>
            <h2 className="text-3xl font-extrabold mt-2 text-zinc-900">
              {value.toLocaleString()}
            </h2>
          </div>
          <div className={`p-4 rounded-2xl ${colorMap[color]}`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}