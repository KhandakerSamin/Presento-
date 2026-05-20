import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UploadCloud, FileText } from "lucide-react";
import TeacherLayout from "@/components/teacher/TeacherLayout";
import { DashboardStats } from "@/components/teacher/DashboardStats";
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
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Presentation Statistics */}
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Presentations Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track the performance and engagement of your uploaded materials.
            </p>
          </div>
          <DashboardStats />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/teacher/presentations/upload"
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-md"><UploadCloud className="w-5 h-5" /></span>
                Upload New Presentation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                Add a new presentation to your library and share it with your students.
              </p>
            </Link>
            <Link
              href="/teacher/presentations"
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-2 rounded-md"><FileText className="w-5 h-5" /></span>
                Manage Presentations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                View, edit, and keep track of all your currently uploaded presentations.
              </p>
            </Link>
        </section>

        <hr className="border-slate-200 dark:border-slate-800"/>

        {/* Existing Sections Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                My Sections
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {sections?.length ?? 0} active section{sections?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href="/teacher/sections/new"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-xl transition-colors"
            >
              + New Section
            </Link>
          </div>
          <SectionList sections={sections || []} pendingTopicCounts={pendingTopicCounts} />
        </section>

      </div>
    </TeacherLayout>
  );
}