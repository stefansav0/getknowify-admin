"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  ClipboardList,
  Star,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Letters", icon: FileText, href: "/letters" },
  { name: "Quizzes", icon: ClipboardList, href: "/quizzes" },
  { name: "Never Have I Ever", icon: ClipboardList, href: "/nhie" },
  { name: "Scores", icon: Star, href: "/scores" },
  { name: "Blog", icon: MessageCircle, href: "/blogs" },
  { name: "Feedback", icon: MessageCircle, href: "/feedback" },
];

export default function Sidebar({ closeSidebar }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        if (closeSidebar) closeSidebar(); // Close sidebar on mobile
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      
      {/* Brand Header */}
      <div className="flex items-center h-20 px-6">
        <h1 className="text-2xl font-bold">GetKnowify</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Check if current route is active
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => closeSidebar && closeSidebar()}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-white text-black font-semibold" // Solid white for active tab
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation (Settings & Logout) */}
      <div className="p-4 border-t border-zinc-800 space-y-2 mt-auto">
        
        {/* Settings Link */}
        <Link
          href="/settings"
          onClick={() => closeSidebar && closeSidebar()}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            pathname === "/settings"
              ? "bg-white text-black font-semibold"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-400 hover:bg-red-950/50 hover:text-red-400 transition-all text-left"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

      </div>
    </div>
  );
}