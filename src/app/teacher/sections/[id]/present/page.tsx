import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PresentationClient from "./PresentationClient";

export default async function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/teacher/login");

  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("id", id)
    .single();

  if (!section) notFound();

  const { data: groups } = await supabase
    .from("groups")
    .select("*, students(*)")
    .eq("section_id", id)
    .order("group_number");
    
  // Fetch existing marks related to groups in this section
  const groupIds = groups?.map(g => g.id) || [];
  const { data: marks } = await supabase
    .from("marks")
    .select("*")
    .in("group_id", groupIds.length > 0 ? groupIds : ['dummy']);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white px-6 h-16 flex items-center justify-between border-b">
         <div>
            <Link href={`/teacher/sections/${id}`} className="text-blue-600 font-bold">&larr; Back to Section</Link>
            <span className="ml-4 font-bold text-slate-800">Presentation Mode: {section.section_code}</span>
         </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <PresentationClient section={section} initialGroups={groups || []} initialMarks={marks || []} />
      </main>
    </div>
  );
}
