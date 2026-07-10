"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // New UI States
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await router.push("/dashboard");
        router.refresh();
      } else {
        setErrorMsg(data.message || "Invalid credentials");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Determine character state
  const isCoveringEyes = focusedField === "password" && !showPassword;
  const isPeeking = focusedField === "password" && showPassword;

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-900">
      
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="relative z-10 w-full max-w-md p-6">
        
        {/* Interactive Cartoon Character Area */}
        <div className="flex flex-col items-center justify-center mb-6 relative">
          
          {/* Speech Bubble */}
          <div className="absolute -top-12 right-12 bg-white text-black px-4 py-2 rounded-2xl rounded-bl-none font-bold text-sm shadow-xl animate-bounce">
            Login, Admin!
          </div>

          {/* SVG Character */}
          <div className="w-40 h-40 relative flex items-end justify-center rounded-full bg-gradient-to-b from-indigo-100 to-indigo-50 shadow-inner overflow-hidden border-4 border-white/10">
            <svg viewBox="0 0 200 200" className="w-full h-full pt-4">
              {/* Shoulders & Office Suit */}
              <path d="M 40 200 L 40 140 Q 100 110 160 140 L 160 200 Z" fill="#1e293b" />
              {/* White Shirt */}
              <path d="M 75 140 L 100 180 L 125 140 Z" fill="#ffffff" />
              {/* Red Tie */}
              <polygon points="95,150 105,150 100,195" fill="#ef4444" />
              
              {/* Head & Neck */}
              <rect x="90" y="80" width="20" height="30" fill="#fcd5ce" />
              <circle cx="100" cy="70" r="35" fill="#fcd5ce" />
              
              {/* Hair */}
              <path d="M 65 70 Q 70 30 100 30 Q 130 30 135 70 Q 130 50 100 50 Q 70 50 65 70 Z" fill="#0f172a" />
              <path d="M 65 65 C 60 40 90 20 110 25 C 130 30 140 50 135 70 C 135 70 120 40 100 40 C 80 40 65 65 65 65 Z" fill="#1e293b" />
              
              {/* Glasses */}
              <rect x="70" y="60" width="25" height="15" rx="3" fill="none" stroke="#333" strokeWidth="3" />
              <rect x="105" y="60" width="25" height="15" rx="3" fill="none" stroke="#333" strokeWidth="3" />
              <line x1="95" y1="67" x2="105" y2="67" stroke="#333" strokeWidth="3" />

              {/* Eyes (Move slightly when typing email) */}
              <circle 
                cx={focusedField === "email" ? "80" : "82"} 
                cy="67" 
                r="3" 
                fill="#000" 
                className="transition-all duration-300"
              />
              <circle 
                cx={focusedField === "email" ? "115" : "117"} 
                cy="67" 
                r="3" 
                fill="#000" 
                className="transition-all duration-300"
              />
              
              {/* Mouth */}
              <path d="M 90 85 Q 100 95 110 85" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />

              {/* HANDS (Animate up to cover eyes) */}
              <g 
                className="transition-transform duration-500 ease-in-out origin-bottom"
                style={{ 
                  transform: isCoveringEyes ? "translateY(-55px)" : isPeeking ? "translateY(-40px)" : "translateY(50px)",
                }}
              >
                {/* Left Hand */}
                <circle cx="75" cy="120" r="18" fill="#fcd5ce" />
                <path d="M 65 110 Q 75 90 85 110" fill="none" stroke="#e8b4a8" strokeWidth="3" strokeLinecap="round" />
                
                {/* Right Hand */}
                <circle cx="125" cy="120" r="18" fill="#fcd5ce" />
                <path d="M 115 110 Q 125 90 135 110" fill="none" stroke="#e8b4a8" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>

        {/* Login Form (Glassmorphism) */}
        <form
          onSubmit={handleLogin}
          className="w-full space-y-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl text-center font-medium animate-pulse">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-500 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-500 pl-11 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1} // Prevents messing up keyboard navigation
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Authenticating...
                </>
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}