"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [searchCode, setSearchCode] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const code = searchCode.trim().toUpperCase();
    if (code) {
      router.push(`/section/${code}`);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white shrink-0"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            P
          </div>
          Presento
        </Link>

        {/* Center nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            How it works
          </a>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center gap-2 flex-1 max-w-xs"
        >
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter section code..."
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shrink-0"
          >
            Go
          </button>
        </form>

        {/* Teacher Login */}
        <Link
          href="/teacher/login"
          className="hidden md:block px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
        >
          Teacher Login
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-slate-600 dark:text-slate-400"
        >
          <div className="w-5 h-0.5 bg-current mb-1"></div>
          <div className="w-5 h-0.5 bg-current mb-1"></div>
          <div className="w-5 h-0.5 bg-current"></div>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter section code..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg"
            >
              Go
            </button>
          </form>
          <a href="#features" className="text-sm text-slate-600 dark:text-slate-400" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-400" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <Link
            href="/teacher/login"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
            onClick={() => setMenuOpen(false)}
          >
            Teacher Login →
          </Link>
        </div>
      )}
    </header>
  );
}
