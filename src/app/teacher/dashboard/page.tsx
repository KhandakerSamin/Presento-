import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import TeacherLayout from "@/components/teacher/TeacherLayout";
import SectionList from "@/components/teacher/SectionList";

export const dynamic = "force-dynamic";

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

  const sectionIds = (sections || []).map((section) => section.id);
  let pendingTopicCounts: Record<string, number> = {};

  if (sectionIds.length > 0) {
    const { data: pendingTopics } = await supabase
      .from("groups")
      .select("section_id")
      .in("section_id", sectionIds)
      .eq("topic_status", "pending");

    pendingTopicCounts = (pendingTopics || []).reduce((acc, group) => {
      acc[group.section_id] = (acc[group.section_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  return (
    <TeacherLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-500 mt-1.5 text-sm">
                Manage your courses and sections
              </p>
            </div>
            <Link
              href="/teacher/sections/new"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add new course
            </Link>
          </div>
        </div>

        {/* Sections Grid */}
        <section>
          {sections && sections.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Your Sections
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {sections.length} active section{sections.length !== 1 ? "s" : ""}
                </p>
              </div>
              <SectionList sections={sections} pendingTopicCounts={pendingTopicCounts} />
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <div className="text-slate-300 dark:text-slate-600 mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                <BookOpen className="w-8 h-8" />
              </div>
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
                Add new course
              </Link>
            </div>
          )}
        </section>

      </div>
    </TeacherLayout>
  );
}