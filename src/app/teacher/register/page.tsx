"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function TeacherRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/teacher/dashboard`
        }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">
              Presento
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Teacher Register
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create an account to manage your sections
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          {success ? (
              <div className="text-center">
                  <div className="mb-4 text-green-500 font-bold text-xl">Success!</div>
                  <p className="text-sm text-slate-600 mb-6">Your account has been created. You can now log in.</p>
                  <Link href="/teacher/login" className="w-full inline-block py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm">
                      Go to Login
                  </Link>
              </div>
          ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@diu.edu.bd"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/teacher/login" className="text-blue-600 hover:underline transition-colors font-medium">
            Log in here
          </Link>
        </p>

        <p className="text-center mt-4 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}