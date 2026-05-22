"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSectionCode } from "@/lib/utils";
import Link from "next/link";

const ALL_SECTIONS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"];

export default function NewCoursePage() {
  const router = useRouter();
  const supabase = createClient();

  const [semester, setSemester] = useState("Summer-2025");
  const [batch, setBatch] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseType, setCourseType] = useState<"Theory" | "Lab">("Theory");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [groupSize, setGroupSize] = useState("5");
  const [totalStudents, setTotalStudents] = useState("50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset total students default when course type changes
  useEffect(() => {
    setTotalStudents(courseType === "Lab" ? "25" : "50");
  }, [courseType]);

  function toggleSection(sec: string) {
    setSelectedSections(prev =>
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (selectedSections.length === 0) {
      setError("Please select at least one section.");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/teacher/login"); return; }

    // Retrieve or insert a fallback Department
    const { data: currDept } = await supabase
      .from("departments")
      .select("id, code")
      .limit(1)
      .single();

    let currDeptId = currDept?.id;
    let currDeptCode = currDept?.code || "GEN";

    if (!currDeptId) {
      const { data: newDept, error: deptError } = await supabase
        .from("departments")
        .insert({ code: "GEN", name: "General" })
        .select()
        .single();
      if (deptError) {
        setError("Failed to init department: " + deptError.message);
        setLoading(false);
        return;
      }
      currDeptId = newDept.id;
      currDeptCode = newDept.code;
    }

    // Get or Create Course
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("course_code", courseCode)
      .single();

    let currCourseId = course?.id;
    if (!currCourseId) {
      const { data: newCourse, error: courseErr } = await supabase
        .from("courses")
        .insert({ course_code: courseCode, course_name: courseTitle, department_id: currDeptId })
        .select()
        .single();
      if (courseErr) {
        setError("Course error: " + courseErr.message);
        setLoading(false);
        return;
      }
      currCourseId = newCourse.id;
    }

    // Expand sections — Lab splits each letter into two sub-sections
    const finalSections: string[] =
      courseType === "Lab"
        ? selectedSections.flatMap(sec => [`${sec}1`, `${sec}2`])
        : selectedSections;

    try {
      const sectionsToInsert = finalSections.map(sec => {
        const secCode = generateSectionCode(currDeptCode, courseCode, Number(batch), sec);
        return {
          course_id: currCourseId!,
          teacher_id: user.id,
          semester,
          batch: Number(batch),
          section: sec,
          section_code: secCode,
          group_size: Number(groupSize),
          is_locked: false,
          is_archived: false,
        };
      });

      const { data: newSections, error: insertError } = await supabase
        .from("sections")
        .insert(sectionsToInsert)
        .select();

      if (insertError) throw insertError;

      // Auto-generate groups for each section
      if (totalStudents && Number(totalStudents) > 0 && newSections) {
        const numGroups = Math.ceil(Number(totalStudents) / Number(groupSize));
        const allGroups = newSections.flatMap(newSec =>
          Array.from({ length: numGroups }, (_, i) => ({
            section_id: newSec.id,
            group_number: i + 1,
          }))
        );
        if (allGroups.length > 0) {
          const { error: groupsError } = await supabase.from("groups").insert(allGroups);
          if (groupsError) throw groupsError;
        }
      }

      router.push("/teacher/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sections.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

  const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
          P
        </div>
        <Link
          href="/teacher/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">Take New Course</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Take New Course</h1>
        <p className="text-sm text-slate-500 mb-8">Fill in the details to generate sections.</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Semester + Batch */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Semester</label>
              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className={inputCls}
              >
                <option>Summer-2025</option>
                <option>Fall-2025</option>
                <option>Spring-2026</option>
                <option>Summer-2026</option>
                <option>Fall-2026</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Batch</label>
              <input
                type="text"
                inputMode="numeric"
                value={batch}
                onChange={e => setBatch(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 42"
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Course Title + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Course Title</label>
              <input
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
                placeholder="e.g. Software Engineering"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Course Code</label>
              <input
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                placeholder="e.g. CSE320"
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Course Type */}
          <div>
            <label className={labelCls}>Course Type</label>
            <div className="flex gap-3">
              {(["Theory", "Lab"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCourseType(type)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    courseType === type
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sections — custom toggle grid, no react-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Sections
              </label>
              {selectedSections.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSections([])}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex flex-wrap gap-2">
                {ALL_SECTIONS.map(sec => {
                  const active = selectedSections.includes(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => toggleSection(sec)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all ${
                        active
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {sec}
                    </button>
                  );
                })}
              </div>

              {selectedSections.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {(courseType === "Lab"
                    ? selectedSections.flatMap(s => [`${s}1`, `${s}2`])
                    : selectedSections
                  ).map(sec => (
                    <span
                      key={sec}
                      className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-900"
                    >
                      {sec}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 text-xs text-slate-400">
                    → {courseType === "Lab" ? selectedSections.length * 2 : selectedSections.length} section{(courseType === "Lab" ? selectedSections.length * 2 : selectedSections.length) !== 1 ? "s" : ""} will be created
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-2">
              {courseType === "Lab"
                ? "Lab mode: each section becomes two sub-sections (e.g. A → A1, A2)."
                : "Theory mode: one section per letter."}
            </p>
          </div>

          {/* Group size + Total students */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Students per Group</label>
              <select
                value={groupSize}
                onChange={e => setGroupSize(e.target.value)}
                className={inputCls}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "student" : "students"} per group
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Total Students per Section</label>
              <input
                type="text"
                inputMode="numeric"
                value={totalStudents}
                onChange={e => setTotalStudents(e.target.value.replace(/\D/g, ""))}
                placeholder={courseType === "Lab" ? "25" : "50"}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Take Course"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}