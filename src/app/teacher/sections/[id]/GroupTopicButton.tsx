"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function GroupTopicButton({
  groupId,
  topic,
}: {
  groupId: string;
  topic: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(topic || "");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("groups")
      .update({ topic: value.trim(), topic_status: "approved" })
      .eq("id", groupId);
    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }
    setSaving(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => {
          setValue(topic || "");
          setIsOpen(true);
        }}
        className="text-xs px-2.5 py-1 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        {topic ? "Edit Topic" : "Add Topic"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {topic ? "Edit Topic" : "Add Topic"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <label className="text-xs text-slate-500">Topic name</label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter topic"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
