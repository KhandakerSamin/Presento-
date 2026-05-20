"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Unlock, Archive } from "lucide-react";

interface Props {
  sectionId: string;
  isLocked: boolean;
}

export default function SectionActions({ sectionId, isLocked }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleLock() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("sections")
      .update({ is_locked: !isLocked })
      .eq("id", sectionId);
    router.refresh();
    setLoading(false);
  }

  async function archiveSection() {
    if (!confirm("Archive this section? It will be hidden from dashboard but data is preserved.")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("sections")
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq("id", sectionId);
    router.push("/teacher/dashboard");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLock}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isLocked ? <><Unlock className="w-4 h-4" /> Unlock</> : <><Lock className="w-4 h-4" /> Lock</>}
      </button>
      <button
        onClick={archiveSection}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <Archive className="w-4 h-4" /> Archive
      </button>
    </div>
  );
}