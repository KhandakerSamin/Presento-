"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Department } from "@/types";

export default function NewCoursePage() {
  const router = useRouter();
  const supabase = createClient();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptId, setDeptId] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase
      .from("departments")
      .select("*")
      .order("code")
      .then(({ data }) => setDepartments(data ?? []));
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/teacher/login"); return; }

    const { error: insertError } = await supabase
      .from("courses")
      .insert({
        department_id: deptId,
        course_code: courseCode.trim().toUpperCase(),
        course_name: courseName.trim()
      });

    if (insertError) {
      if (insertError.code === "23505") { // unique violation
         setError("A course with this code already exists.");
      } else {
         setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setCourseCode("");
    setCourseName("");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>
        <Link href="/teacher/dashboard" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">Add Course</span>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Add a New Course
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Add a missing course to your department so you can create sections for it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Department
            </label>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Course Code
            </label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. SE221"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Course Name
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Software Engineering"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 text-green-600 dark:text-green-400 text-sm">
              Course successfully added! You can now select it when creating a new section.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? "Adding..." : "Add Course"}
          </button>
        </form>
      </main>
    </div>
  );
}