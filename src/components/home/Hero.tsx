import Link from "next/link";
import SectionSearch from "./SectionSearch";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
        Built for SWE Department — DIU
      </div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-slate-900 dark:text-white leading-tight max-w-3xl">
        Manage Class{" "}
        <span className="text-blue-600 dark:text-blue-400">Presentations</span>{" "}
        Smarter
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 text-center max-w-xl leading-relaxed">
        No more WhatsApp chaos or Google Sheets. One clean system for students
        to join groups, submit slides, and teachers to run presentations live.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <a
          href="#search"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-center"
        >
          Enter Section
        </a>
        <Link
          href="/teacher/login"
          className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-center"
        >
          Teacher Login
        </Link>
      </div>

      {/* Search Box */}
      <div id="search" className="mt-14 w-full max-w-lg">
        <SectionSearch large />
      </div>

      {/* Preview cards row */}
      <div className="mt-16 w-full max-w-4xl grid grid-cols-3 gap-4 opacity-60">
        {["Group 1", "Group 2", "Group 3"].map((g, i) => (
          <div
            key={g}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 mb-3"></div>
            <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800 mb-2"></div>
            <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800 mb-4"></div>
            <div
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                i === 0
                  ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                  : i === 1
                  ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
              }`}
            >
              {i === 0 ? "Submitted" : i === 1 ? "Full" : "Open"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}