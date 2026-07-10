"use client";

import { useRouter } from "next/navigation";
import Link from "next/link"; // <-- Import Link

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      
      <h2 className="text-xl font-semibold">
        Admin Dashboard
      </h2>

      <div className="flex items-center gap-6">
        
        {/* Settings Link */}
        <Link 
          href="/settings"
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          Settings
        </Link>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          Logout
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          A
        </div>
      </div>

    </div>
  );
}