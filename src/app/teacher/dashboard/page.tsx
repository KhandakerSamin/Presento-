import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/teacher/LogoutButton";
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
        <SectionList sections={sections || []} pendingTopicCounts={pendingTopicCounts} />
      </main>
    </div>
  );
}