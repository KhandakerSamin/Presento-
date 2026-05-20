"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSectionCode } from "@/lib/utils";
import Link from "next/link";
import Select from "react-select";

export default function NewCoursePage() {
  const router = useRouter();
  const supabase = createClient();

  const [semester, setSemester] = useState("Summer-2025");
  const [batch, setBatch] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseType, setCourseType] = useState<"Theory" | "Lab">("Theory");
  
  // This handles the react-select values
  const [selectedSections, setSelectedSections] = useState<{label: string, value: string}[]>([]);
  
  const sectionOptions = ["A", "B", "C", "D", "E", "F", "G", "H"].map(s => ({ label: s, value: s }));

  const [groupSize, setGroupSize] = useState("5");
  const [totalStudents, setTotalStudents] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [assignmentType, setAssignmentType] = useState<"manual" | "random" | "student_select" | "proposal">("manual");
  const [topics, setTopics] = useState<string>("");

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

    // Retrieve or Insert a Department so we don't break foreign keys, or ideally create the course directly.
    let { data: currDept } = await supabase.from("departments").select("id, code").limit(1).single();
    let currDeptId = currDept?.id;
    let currDeptCode = currDept?.code || "GEN";

    if (!currDeptId) {
      const { data: newDept, error: deptError } = await supabase
        .from("departments")
        .insert({ code: "GEN", name: "General" })
        .select()
        .single();
      if (deptError) { setError("Failed to init department: " + deptError.message); setLoading(false); return; }
      currDeptId = newDept.id;
      currDeptCode = newDept.code;
    }

    // Get or Create Course
    let { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("course_code", courseCode)
      .single();

    let currCourseId = course?.id;
    if (!currCourseId) {
       const { data: newCourse, error: courseErr } = await supabase
         .from("courses")
         .insert({
           course_code: courseCode,
           course_name: courseTitle,
           department_id: currDeptId
         })
         .select()
         .single();
       if (courseErr) { setError("Course error: " + courseErr.message); setLoading(false); return; }
       currCourseId = newCourse.id;
    }

    // Gen section arrays
    const baseSections = selectedSections.map(s => s.value);
    let finalSections: string[] = [];
    if (courseType === "Lab") {
      baseSections.forEach(sec => {
        finalSections.push(`${sec}1`, `${sec}2`);
      });
    } else {
      finalSections = baseSections;
    }

    try {
      const topicsArray = (topics || "").split('\n').map(t => t.trim()).filter(Boolean);

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

      // Group generation for each newly inserted section
      if (totalStudents && Number(totalStudents) > 0 && newSections) {
        let allGroups: any[] = [];
        const numGroups = Math.ceil(Number(totalStudents) / Number(groupSize));
        
        newSections.forEach(newSec => {
          const groupsData = Array.from({ length: numGroups }).map((_, i) => ({
            section_id: newSec.id,
            group_number: i + 1,
          }));
          allGroups.push(...groupsData);
        });

        if (allGroups.length > 0) {
          const { error: groupsError } = await supabase.from("groups").insert(allGroups);
          if (groupsError) throw groupsError;
        }
      }

      router.push(`/teacher/dashboard`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create sections.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>
        <Link href="/teacher/dashboard" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">Take New Course</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Take New Course
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Fill in the details to generate sections.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Course Title
              </label>
              <input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
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
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CSE320"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
               Course Type
             </label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    checked={courseType === "Theory"}
                    onChange={() => setCourseType("Theory")}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  Theory
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    checked={courseType === "Lab"}
                    onChange={() => setCourseType("Lab")}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  Lab
                </label>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
               Sections
             </label>
             <Select
               isMulti
               options={sectionOptions}
               value={selectedSections}
               onChange={(val) => setSelectedSections(val as {label: string, value: string}[])}
               className="text-sm react-select-container"
               classNamePrefix="react-select"
               placeholder="Select sections (e.g. A, B, C)..."
             />
             <p className="text-xs text-slate-500 mt-2">
               {courseType === "Lab" 
                 ? "Lab mode: 2 sub-sections will be generated per choice (e.g. A becomes A1, A2)." 
                 : "Theory mode: 1 section will be generated per choice."}
             </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Total Students per section
              </label>
              <input
                type="number"
                value={totalStudents}
                onChange={(e) => setTotalStudents(e.target.value)}
                placeholder="e.g. 40"
                min={1}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Topic Assignment Options</h3>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="topicAssignment" 
                  value="manual"
                  checked={assignmentType === "manual"}
                  onChange={(e) => setAssignmentType(e.target.value as any)}
                  className="text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                Assign manually
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="topicAssignment" 
                  value="random"
                  checked={assignmentType === "random"}
                  onChange={(e) => setAssignmentType(e.target.value as any)}
                  className="text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                Give random topic
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="topicAssignment" 
                  value="student_select"
                  checked={assignmentType === "student_select"}
                  onChange={(e) => setAssignmentType(e.target.value as any)}
                  className="text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                Student select topic (max 1 per group)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="topicAssignment" 
                  value="proposal"
                  checked={assignmentType === "proposal"}
                  onChange={(e) => setAssignmentType(e.target.value as any)}
                  className="text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                Take topic proposal from student
              </label>
            </div>
            {(assignmentType === "random" || assignmentType === "student_select") && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Available Topics (One per line)
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder={"e.g.\nMachine Learning Basics\nReact Hooks Deep Dive\nDatabase Optimization"}
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Add multiple topics separated by new lines.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Take Course"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}