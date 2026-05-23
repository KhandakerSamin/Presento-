import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ClientSectionView from "./ClientSectionViewNew";

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
    .select("*, course:courses(course_code, course_name, department:departments(code, name))")
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <ClientSectionView section={section} initialGroups={groups || []} />
    </div>
  );
}
