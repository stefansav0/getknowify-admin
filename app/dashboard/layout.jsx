"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* MOBILE HEADER */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-4">
          {/* LOGO */}
          <div>
            <h1 className="text-2xl font-bold">GetKnowify</h1>
            <p className="text-xs text-zinc-500">Admin Dashboard</p>
          </div>

          {/* MENU BUTTON */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-12 w-12 rounded-2xl border bg-white flex items-center justify-center shadow-sm"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[85%] max-w-[320px] lg:w-64 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* CLOSE BUTTON */}
        <div className="lg:hidden absolute top-4 right-4 z-50">
          <button
            onClick={() => setSidebarOpen(false)}
            className="bg-white text-black p-2 rounded-xl shadow"
          >
            <X size={22} />
          </button>
        </div>

        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      {/* Added lg:ml-64 here to push content past the fixed sidebar on desktop */}
      <div className="flex-1 min-h-screen lg:ml-64 flex flex-col">
        {/* DESKTOP NAVBAR */}
        <div className="hidden lg:block sticky top-0 z-40 bg-zinc-100">
          <Navbar />
        </div>

        {/* CONTENT */}
        <main className="p-4 md:p-6 overflow-x-hidden flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}