"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Transition } from "framer-motion";
import { Lock, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

interface AuthSplitPanelProps {
  initialMode?: AuthMode;
}

const panelTransition: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 20,
};

export function AuthSplitPanel({ initialMode = "login" }: AuthSplitPanelProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isRegister = mode === "register";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/teacher/dashboard");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/teacher/dashboard`,
        data: name ? { display_name: name } : undefined,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  function resetState(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-rose-500/[0.08] blur-3xl" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-center">
        <div className="relative hidden min-h-[560px] w-full overflow-hidden rounded-[32px] bg-white/95 shadow-[0_24px_100px_-50px_rgba(0,0,0,0.8)] md:block">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 w-1/2",
              "bg-gradient-to-br from-indigo-500/90 via-indigo-400/90 to-rose-400/85",
              "text-white",
            )}
            animate={{ x: isRegister ? "100%" : "0%" }}
            transition={panelTransition}
          >
            <div
              className={cn(
                "absolute top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-white/10",
                isRegister ? "-left-52" : "-right-52",
              )}
            />
            <div className="relative flex h-full flex-col items-center justify-center px-10 text-center">
              <motion.div
                animate={{ opacity: isRegister ? 1 : 0, y: isRegister ? 0 : -10 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ pointerEvents: isRegister ? "auto" : "none" }}
              >
                <h2 className="text-3xl font-semibold">One of us?</h2>
                <p className="mt-3 max-w-xs text-sm text-white/80">
                  Welcome back! Sign in to continue your journey with us.
                </p>
                <button
                  type="button"
                  onClick={() => resetState("login")}
                  className="mt-6 rounded-full border border-white/70 px-8 py-2 text-sm font-semibold uppercase tracking-wide transition hover:bg-white/10"
                >
                  Sign In
                </button>
              </motion.div>

              <motion.div
                animate={{ opacity: isRegister ? 0 : 1, y: isRegister ? 10 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ pointerEvents: isRegister ? "none" : "auto" }}
              >
                <h2 className="text-3xl font-semibold">New here?</h2>
                <p className="mt-3 max-w-xs text-sm text-white/80">
                  Join us today and discover a world of possibilities. Create your
                  account in seconds!
                </p>
                <button
                  type="button"
                  onClick={() => resetState("register")}
                  className="mt-6 rounded-full border border-white/70 px-8 py-2 text-sm font-semibold uppercase tracking-wide transition hover:bg-white/10"
                >
                  Sign Up
                </button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            animate={{ x: isRegister ? "0%" : "100%" }}
            transition={panelTransition}
          >
            <div className="flex h-full flex-col items-center justify-center px-12">
              <div className="mb-6 text-center">
                <Link href="/" className="inline-flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#030303] text-white font-bold">
                    P
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    Presento
                  </span>
                </Link>
              </div>

              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full"
              >
                <h1 className="text-center text-3xl font-semibold text-slate-800">
                  {isRegister ? "Sign up" : "Sign in"}
                </h1>

                <form
                  onSubmit={isRegister ? handleRegister : handleLogin}
                  className="mt-8 space-y-4"
                >
                  {isRegister && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-indigo-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Username"
                        className="w-full rounded-full border border-slate-200 bg-slate-100/80 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="w-full rounded-full border border-slate-200 bg-slate-100/80 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-rose-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={isRegister ? 6 : undefined}
                      className="w-full rounded-full border border-slate-200 bg-slate-100/80 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/70"
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
                      {error}
                    </div>
                  )}

                  {isRegister && success ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-600">
                      Account created. You can sign in now.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-600 disabled:opacity-60"
                    >
                      {loading
                        ? isRegister
                          ? "Creating..."
                          : "Signing in..."
                        : isRegister
                          ? "Sign up"
                          : "Login"}
                    </button>
                  )}
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  {isRegister
                    ? "Or sign up with social platforms"
                    : "Or sign in with social platforms"}
                </div>
                <div className="mt-3 flex items-center justify-center gap-3">
                  {[
                    { label: "G" },
                    { label: "f" },
                    { label: "x" },
                    { label: "in" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="h-10 w-10 rounded-full border border-slate-200 text-sm font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-500"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="w-full rounded-[28px] bg-white/95 px-6 py-10 shadow-[0_24px_100px_-50px_rgba(0,0,0,0.8)] md:hidden">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#030303] text-white font-bold">
                P
              </div>
              <span className="text-xl font-bold text-slate-900">Presento</span>
            </Link>
          </div>

          <h1 className="mt-6 text-center text-3xl font-semibold text-slate-800">
            {isRegister ? "Sign up" : "Sign in"}
          </h1>

          <form
            onSubmit={isRegister ? handleRegister : handleLogin}
            className="mt-8 space-y-4"
          >
            {isRegister && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-indigo-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Username"
                  className="w-full rounded-full border border-slate-200 bg-slate-100/80 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-indigo-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-full border border-slate-200 bg-slate-100/80 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-rose-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={isRegister ? 6 : undefined}
                className="w-full rounded-full border border-slate-200 bg-slate-100/80 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/70"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
                {error}
              </div>
            )}

            {isRegister && success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-600">
                Account created. You can sign in now.
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-600 disabled:opacity-60"
              >
                {loading
                  ? isRegister
                    ? "Creating..."
                    : "Signing in..."
                  : isRegister
                    ? "Sign up"
                    : "Login"}
              </button>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isRegister
              ? "Or sign up with social platforms"
              : "Or sign in with social platforms"}
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            {[
              { label: "G" },
              { label: "f" },
              { label: "x" },
              { label: "in" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="h-10 w-10 rounded-full border border-slate-200 text-sm font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-500"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            {isRegister ? (
              <button
                type="button"
                onClick={() => resetState("login")}
                className="text-sm font-semibold text-indigo-500"
              >
                Already have an account? Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => resetState("register")}
                className="text-sm font-semibold text-indigo-500"
              >
                New here? Sign up
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
