"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSectionCode } from "@/lib/utils";
import Link from "next/link";

type Department = { id: string; code: string; name: string };
type Course = { id: string; course_code: string; course_name: string };

export default function NewSectionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [deptId, setDeptId] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("Summer-2025");
  const [batch, setBatch] = useState("");
  const [section, setSection] = useState("A");
  const [groupSize, setGroupSize] = useState("5");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Preview of the generated code
  const previewCode =
    deptCode && courseCode && batch && section
      ? generateSectionCode(deptCode, courseCode, Number(batch), section)
      : "---";

  // Load departments on mount
  useEffect(() => {
    supabase
      .from("departments")
      .select("*")
      .order("code")
      .then(({ data }) => setDepartments(data ?? []));
  }, [supabase]);

  // Load courses when department changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!deptId) { setCourses([]); return; }
    supabase
      .from("courses")
      .select("*")
      .eq("department_id", deptId)
      .order("course_code")
      .then(({ data }) => setCourses(data ?? []));
  }, [deptId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/teacher/login"); return; }

    const sectionCode = generateSectionCode(deptCode, courseCode, Number(batch), section);

    // Check for duplicate code
    const { data: existing } = await supabase
      .from("sections")
      .select("id")
      .eq("section_code", sectionCode)
      .single();

    if (existing) {
      setError(`Section code ${sectionCode} already exists. Change batch or section.`);
      setLoading(false);
      return;
    }

    const { data: newSection, error: insertError } = await supabase
      .from("sections")
      .insert({
        course_id: courseId,
        teacher_id: user.id,
        semester,
        batch: Number(batch),
        section,
        section_code: sectionCode,
        group_size: Number(groupSize),
        is_locked: false,
        is_archived: false,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/teacher/sections/${newSection.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>
        <Link href="/teacher/dashboard" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">New Section</span>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Create New Section
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Fill in the details. The section code is generated automatically.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Department
            </label>
            <select
              value={deptId}
              onChange={(e) => {
                const dept = departments.find((d) => d.id === e.target.value);
                setDeptId(e.target.value);
                setDeptCode(dept?.code ?? "");
                setCourseId("");
                setCourseCode("");
              }}
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

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Course
            </label>
            <select
              value={courseId}
              onChange={(e) => {
                const c = courses.find((c) => c.id === e.target.value);
                setCourseId(e.target.value);
                setCourseCode(c?.course_code ?? "");
              }}
              required
              disabled={!deptId}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} — {c.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester, Batch, Section row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Summer-2025</option>
                <option>Fall-2025</option>
                <option>Spring-2026</option>
                <option>Summer-2026</option>
                <option>Fall-2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Batch
              </label>
              <input
                type="number"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="42"
                required
                min={1}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["A","B","C","D","E","F"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Group size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Students per Group
            </label>
            <select
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2,3,4,5,6].map((n) => (
                <option key={n} value={n}>{n} students per group</option>
              ))}
            </select>
          </div>

          {/* Preview code */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Generated section code</p>
            <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
              {previewCode}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? "Creating..." : "Create Section"}
          </button>
        </form>
      </main>
    </div>
  );
}