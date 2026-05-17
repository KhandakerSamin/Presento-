import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ClientSectionView from "./ClientSectionView";

export default async function SectionStudentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);
  const supabase = await createClient();

  // Fetch section
  const { data: section } = await supabase
    .from("sections")
    .select("*, course:courses(course_code, course_name)")
    .eq("section_code", decodedCode)
    .single();

  if (!section) notFound();

  // Fetch groups and students
  const { data: groups } = await supabase
    .from("groups")
    .select("*, students(*)")
    .eq("section_id", section.id)
    .order("group_number");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</Link>
          <span className="font-semibold">{section.section_code}</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Section: {section.section_code}</h1>
        <p className="mb-8">{section.course?.course_name}</p>

        {section.is_locked ? (
          <div className="bg-amber-50 text-amber-600 p-4 rounded-xl">
            This section is currently locked by the teacher.
          </div>
        ) : (
          <ClientSectionView section={section} initialGroups={groups || []} />
        )}
      </main>
    </div>
  );
}
