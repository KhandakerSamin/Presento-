import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Check, Presentation, ExternalLink } from "lucide-react";
import SectionActions from "@/components/teacher/SectionActions";
import WorkflowControls from "./WorkflowControls";
import GroupList from "@/components/teacher/GroupList";

export const dynamic = "force-dynamic";

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/teacher/login");

  // Fetch section with course + department
  const { data: section } = await supabase
    .from("sections")
    .select("*, course:courses(course_code, course_name, department:departments(code, name))")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (!section) notFound();

  // Fetch groups with students
  const { data: groups } = await supabase
    .from("groups")
    .select("*, students(*)")
    .eq("section_id", id)
    .order("group_number");

  const groupIds = groups?.map(g => g.id) || [];
  const { data: marks } = await supabase
    .from("marks")
    .select("*")
    .in("group_id", groupIds.length > 0 ? groupIds : ['dummy']);

  const totalGroups = groups?.length ?? 0;
  const submittedGroups = groups?.filter((g) => g.slide_link).length ?? 0;
  const pendingGroups = totalGroups - submittedGroups;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>
          <Link href="/teacher/dashboard" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">
            {section.section_code}
          </span>
        </div>
        <SectionActions sectionId={id} isLocked={section.is_locked} />
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {section.section_code}
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {section.course?.course_name}
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                {section.semester} · Batch {section.batch} · Section {section.section} · {section.group_size} per group
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${
                section.is_locked
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                  : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              }`}>
                {section.is_locked ? <Lock className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                {section.is_locked ? "Locked" : "Active"}
              </span>
            </div>
          </div>

          {/* Minimal Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Groups", value: groups?.length ?? 0, icon: Users },
              { label: "Submitted", value: groups?.filter((g) => g.slide_link).length ?? 0, color: "text-green-600 dark:text-green-400" },
              { label: "Pending", value: groups?.filter((g) => !g.slide_link).length ?? 0, color: "text-amber-600 dark:text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions & Workflow */}
        <div className="flex flex-wrap items-center gap-3 mb-8 bg-white dark:bg-slate-900 md:px-5 md:py-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <WorkflowControls section={section} groups={groups || []} />
          
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

          <Link
            href={`/teacher/sections/${id}/present`}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-xl transition-all shadow-sm"
          >
            <Presentation className="w-4 h-4" />
            Presentation Panel
          </Link>
          
          <a
            href={`/section/${section.section_code}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Student View
          </a>
        </div>

        {/* All Groups Unified View */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Groups & Topics</h3>
            <p className="text-sm text-slate-500 mt-1">Manage all group assignments and topics</p>
          </div>
          <GroupList groups={groups || []} section={section} />
        </div>
      </main>
    </div>
  );
}