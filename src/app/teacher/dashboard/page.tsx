import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/teacher/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/teacher/login");

  // Fetch this teacher's sections (not archived)
  const { data: sections } = await supabase
    .from("sections")
    .select("*, course:courses(course_code, course_name, department:departments(code))")
    .eq("teacher_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            Presento
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-sm text-slate-500">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:block">
            {user.email}
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Sections
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {sections?.length ?? 0} active section
              {sections?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/teacher/sections/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Take New Course
          </Link>
        </div>

        {/* Sections grid */}
        {sections && sections.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/teacher/sections/${section.id}`}
                className="group block p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-sm"
              >
                {/* Section code badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                    {section.section_code}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      section.is_locked
                        ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                        : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {section.is_locked ? "Locked" : "Active"}
                  </span>
                </div>

                {/* Course info */}
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  {section.course?.course_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {section.semester} · Batch {section.batch} · Section{" "}
                  {section.section}
                </p>

                {/* Arrow on hover */}
                <div className="mt-4 text-xs text-slate-400 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                  Manage section
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              No sections yet
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Take a course to generate your first section
            </p>
            <Link
              href="/teacher/sections/new"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Take First Course
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}