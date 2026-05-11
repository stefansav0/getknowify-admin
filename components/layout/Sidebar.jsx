"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  ClipboardList,
  Trophy,
  Star,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Letters",
    icon: FileText,
    href: "/letters",
  },
  {
    name: "Quizzes",
    icon: ClipboardList,
    href: "/quizzes",
  },
  {
    name: "Scores",
    icon: Star,
    href: "/scores",
  },
  {
    name: "Blog",
    icon: MessageCircle,
    href: "/blogs",
  },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-black text-white fixed left-0 top-0 p-6">

      <h1 className="text-2xl font-bold mb-10">
        GetKnowify
      </h1>

      <div className="space-y-4">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition"
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </Link>
          );
        })}

      </div>
    </div>
  );
}