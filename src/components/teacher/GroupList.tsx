"use client";

import { Group, Section } from "@/types";
import GroupTopicButton from "./GroupTopicButton";
import { Edit2, Users } from "lucide-react";

interface Props {
  groups: Group[];
  section: Section;
}

export default function GroupList({ groups, section }: Props) {
  const isManualMode = section.topic_assignment_mode === "manual";

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <Users className="w-8 h-8 text-slate-300 dark:text-slate-500 mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No groups yet. Students will appear here when they join.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div
          key={group.id}
          className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-start justify-between gap-6">
            {/* Left: Group Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {group.group_number}
                  </span>
                  {group.custom_name && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-900 dark:text-white">{group.custom_name}</span>
                      <span className="text-slate-400 ml-1">—</span>
                    </div>
                  )}
                </div>
                
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
                  group.slide_link
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50"
                    : (group.students?.length ?? 0) >= section.group_size
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}>
                  {group.slide_link ? "Submitted" : (group.students?.length ?? 0) >= section.group_size ? "Full" : "Open"}
                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                  {group.students?.length ?? 0}/{section.group_size} members
                </span>
              </div>

              {/* Student List */}
              {group.students && group.students.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                  {group.students.map((student) => (
                    <div key={student.id} className="flex items-center gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{student.name}</span>
                      <span className="text-slate-400">({student.student_id})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Topic & Actions */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              {/* Topic Display */}
              {isManualMode ? (
                <GroupTopicButton group={group} isTeacher={true} />
              ) : group.topic ? (
                <div className="flex flex-col items-end">
                  <p className="text-sm font-medium text-slate-900 dark:text-white text-right leading-snug max-w-xs">
                    {group.topic}
                  </p>
                  {group.topic_status === "pending" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1.5">
                      Pending Approval
                    </span>
                  )}
                  {group.topic_status === "rejected" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mt-1.5">
                      Rejected
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No topic assigned
                </span>
              )}

              {/* Slides Link */}
              {group.slide_link && (
                <a
                  href={group.slide_link}
                  target="_blank"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Slides ↗
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}