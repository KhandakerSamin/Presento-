"use client";

import { useState } from "react";
import { Group } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  group: Group;
  isTeacher?: boolean;
}

export default function GroupTopicButton({ group, isTeacher = true }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState(group.topic || "");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("groups")
        .update({ 
          topic: topic.trim(),
          topic_status: "approved" 
        })
        .eq("id", group.id);

      if (error) {
        alert("Failed to save topic: " + error.message);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          group.topic
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
        }`}
      >
        {group.topic ? `✓ ${group.topic}` : "+ Add Topic"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {isTeacher ? "Assign Topic to " : "Select Topic for "} Group {group.group_number}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter topic name"
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {group.students && group.students.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Group Members:</p>
                  <div className="space-y-1">
                    {group.students.map((student) => (
                      <p key={student.id} className="text-xs text-slate-700 dark:text-slate-300">
                        • {student.name} ({student.student_id})
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? "Saving..." : "Save Topic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}