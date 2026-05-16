import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SectionActions from "@/components/teacher/SectionActions";

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
        {/* Section info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {section.section_code}
            </h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              section.is_locked
                ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
            }`}>
              {section.is_locked ? "🔒 Locked" : "✓ Active"}
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            {section.course?.course_name} · {section.semester} · Batch {section.batch} · Section {section.section}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Groups", value: totalGroups, color: "text-slate-900 dark:text-white" },
            { label: "Submitted", value: submittedGroups, color: "text-green-600 dark:text-green-400" },
            { label: "Pending", value: pendingGroups, color: "text-amber-600 dark:text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
              <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={`/teacher/sections/${id}/present`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            🎤 Start Presentation
          </Link>
          <a
            href={`/section/${section.section_code}`}
            target="_blank"
            className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-colors"
          >
            👁 Student View ↗
          </a>
        </div>

        {/* Groups table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Groups</h2>
          </div>
          {groups && groups.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {groups.map((group) => (
                <div key={group.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">
                      {group.group_number}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {group.topic || <span className="text-slate-400 italic">No topic assigned</span>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {group.students?.length ?? 0}/{section.group_size} students
                        {group.students?.map((s: { name: string }) => s.name).join(", ")
                          ? ` · ${group.students?.map((s: { name: string }) => s.name).join(", ")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {group.slide_link ? (
                      <a
                        href={group.slide_link}
                        target="_blank"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Slides ↗
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No slides</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      group.slide_link
                        ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                        : (group.students?.length ?? 0) >= section.group_size
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {group.slide_link ? "Submitted" : (group.students?.length ?? 0) >= section.group_size ? "Full" : "Open"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No groups yet. Students will appear here when they join.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}