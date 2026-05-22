"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSectionCode } from "@/lib/utils";
import Link from "next/link";
import Select from "react-select";

type AssignmentType = "manual" | "random" | "student_select" | "proposal";

const sectionOptions = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"].map(s => ({
  label: s,
  value: s,
}));

// react-select custom styles — adapts to light/dark automatically via CSS vars
const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "#3b82f6" : "rgb(var(--border-color, 226 232 240))",
    borderRadius: "0.75rem",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.3)" : "none",
    minHeight: "42px",
    "&:hover": { borderColor: "#3b82f6" },
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 50,
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    padding: "4px",
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    borderRadius: "0.5rem",
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "rgba(59,130,246,0.08)"
      : "transparent",
    color: state.isSelected ? "#fff" : "inherit",
    cursor: "pointer",
    padding: "6px 10px",
  }),
  multiValue: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderRadius: "0.4rem",
  }),
  multiValueLabel: (base: Record<string, unknown>) => ({
    ...base,
    color: "#3b82f6",
    fontWeight: 600,
    fontSize: "0.8rem",
    padding: "1px 4px",
  }),
  multiValueRemove: (base: Record<string, unknown>) => ({
    ...base,
    color: "#3b82f6",
    borderRadius: "0 0.4rem 0.4rem 0",
    "&:hover": { backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" },
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "0.875rem",
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: "inherit",
  }),
};

export default function NewCoursePage() {
  const router = useRouter();
  const supabase = createClient();

  const [semester, setSemester] = useState("Summer-2025");
  const [batch, setBatch] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseType, setCourseType] = useState<"Theory" | "Lab">("Theory");
  const [selectedSections, setSelectedSections] = useState<{ label: string; value: string }[]>([]);
  const [groupSize, setGroupSize] = useState("5");
  const [totalStudents, setTotalStudents] = useState("50");
  const [assignmentType, setAssignmentType] = useState<AssignmentType>("manual");
  const [topics, setTopics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync default total students when course type toggles
  useEffect(() => {
    setTotalStudents(courseType === "Lab" ? "25" : "50");
  }, [courseType]);

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
    const baseSections = selectedSections.map(s => s.value);
    const finalSections: string[] =
      courseType === "Lab"
        ? baseSections.flatMap(sec => [`${sec}1`, `${sec}2`])
        : baseSections;

    try {
      const topicsArray = (topics || "").split("\n").map(t => t.trim()).filter(Boolean);

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
          topic_assignment_type: assignmentType,
          topics: topicsArray,
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
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
              {/* Plain text input — no spinner arrows */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={batch}
                onChange={e => setBatch(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 42"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Course Title + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Course Title
              </label>
              <input
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
                placeholder="e.g. Software Engineering"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Course Code
              </label>
              <input
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                placeholder="e.g. CSE320"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Course Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Course Type
            </label>
            <div className="flex gap-4">
              {(["Theory", "Lab"] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    checked={courseType === type}
                    onChange={() => setCourseType(type)}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Sections — react-select, properly styled */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Sections
            </label>
            <Select
              isMulti
              options={sectionOptions}
              value={selectedSections}
              onChange={val => setSelectedSections(val as { label: string; value: string }[])}
              styles={selectStyles}
              placeholder="Select sections (e.g. A, B, C)…"
              classNamePrefix="rs"
            />
            <p className="text-xs text-slate-500 mt-2">
              {courseType === "Lab"
                ? "Lab mode: 2 sub-sections generated per choice (e.g. A → A1, A2)."
                : "Theory mode: 1 section generated per choice."}
            </p>
          </div>

          {/* Group size + Total students */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Students per Group
              </label>
              <select
                value={groupSize}
                onChange={e => setGroupSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* 1–10 */}
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "student" : "students"} per group
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Total Students per Section
              </label>
              {/* Plain text input — no spinner arrows; default depends on courseType */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={totalStudents}
                onChange={e => setTotalStudents(e.target.value.replace(/\D/g, ""))}
                placeholder={courseType === "Lab" ? "25" : "50"}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Topic Assignment */}
          <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Topic Assignment Options
            </h3>

            <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
              {(
                [
                  { value: "manual",         label: "Assign manually" },
                  { value: "random",         label: "Give random topic" },
                  { value: "student_select", label: "Student selects topic (max 1 per group)" },
                  { value: "proposal",       label: "Take topic proposal from student" },
                ] as { value: AssignmentType; label: string }[]
              ).map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="topicAssignment"
                    value={opt.value}
                    checked={assignmentType === opt.value}
                    onChange={() => setAssignmentType(opt.value)}
                    className="w-4 h-4 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Topics textarea — only for random or student_select */}
            {(assignmentType === "random" || assignmentType === "student_select") && (
              <div className="mt-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Available Topics <span className="text-slate-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  rows={5}
                  placeholder={"Machine Learning Basics\nReact Hooks Deep Dive\nDatabase Optimization"}
                  value={topics}
                  onChange={e => setTopics(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Add multiple topics separated by new lines.
                </p>
              </div>
            )}
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