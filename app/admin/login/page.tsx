"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

// In production, store this in an environment variable:
// process.env.NEXT_PUBLIC_ADMIN_PASSWORD
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "scholars2025";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("sc_admin_auth", "true");
        router.push("/admin");
      } else {
        setError("Incorrect password. Please try again.");
        setLoading(false);
      }
    }, 600); // brief delay for UX feel
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,166,35,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#051020] border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#f5a623] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#f5a623]/20">
              <Trophy size={32} className="text-[#0a1628]" />
            </div>
            <h1 className="text-white font-black text-2xl">Admin Portal</h1>
            <p className="text-white/40 text-sm mt-1">AventoLinks Scholars Challenge</p>
          </div>

          {/* Auth badge */}
          <div className="flex items-center justify-center gap-2 bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-xl px-4 py-2 mb-6">
            <ShieldCheck size={16} className="text-[#f5a623]" />
            <span className="text-[#f5a623] text-sm font-medium">Secured Access Only</span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 focus:border-[#f5a623]/50 focus:ring-2 focus:ring-[#f5a623]/20 rounded-xl px-4 py-3.5 text-white placeholder-white/20 outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a1628] font-black py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                "Enter Admin Panel"
              )}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">
            Default password: <span className="text-white/40 font-mono">scholars2025</span>
            <br />
            Set <span className="font-mono text-white/30">NEXT_PUBLIC_ADMIN_PASSWORD</span> in .env.local to change it.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          Not an admin?{" "}
          <a href="/" className="text-[#f5a623]/60 hover:text-[#f5a623] transition-colors">
            Back to main site
          </a>
        </p>
      </div>
    </div>
  );
}
