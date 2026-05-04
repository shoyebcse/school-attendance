"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, LogIn, ShieldCheck, BookOpen } from "lucide-react";
import { login, isAuthenticated, DEMO_ACCOUNTS } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const user = await login(email.trim(), password);
    if (user) {
      router.replace("/");
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

  const managerAccounts = DEMO_ACCOUNTS.filter((a) => a.role === "manager");
  const teacherAccounts = DEMO_ACCOUNTS.filter((a) => a.role === "teacher");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">EduAttend</h1>
          <p className="text-blue-200 mt-1">School Attendance Manager</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to manage your school
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
            {/* Manager */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck size={11} />
                Manager Account
              </p>
              {managerAccounts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => fillDemo(a.email, a.hint)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-transparent hover:border-amber-200 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {a.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                    <p className="text-xs text-gray-400 truncate">{a.email}</p>
                  </div>
                  <span className="text-xs text-amber-600 font-medium flex-shrink-0">Use</span>
                </button>
              ))}
            </div>

            {/* Teachers */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen size={11} />
                Teacher Accounts
              </p>
              <div className="space-y-2">
                {teacherAccounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => fillDemo(a.email, a.hint)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {a.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                      <p className="text-xs text-gray-400 truncate">{a.email}</p>
                    </div>
                    <span className="text-xs text-blue-500 font-medium flex-shrink-0">Use</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
