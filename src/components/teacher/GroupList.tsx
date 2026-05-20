"use client";

import { Group, Section } from "@/types";
import GroupTopicButton from "./GroupTopicButton";

interface Props {
  groups: Group[];
  section: Section;
}

export default function GroupList({ groups, section }: Props) {
  const isManualMode = section.topic_assignment_mode === "manual";

  if (groups.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">No groups yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div
          key={group.id}
          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                  G{group.group_number}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  group.slide_link
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : (group.students?.length ?? 0) >= section.group_size
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {group.slide_link ? "Submitted" : (group.students?.length ?? 0) >= section.group_size ? "Full" : "Open"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {group.students?.length || 0}/{section.group_size} members
                </span>
              </div>

              {group.students && group.students.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                  {group.students.map((student) => (
                    <p key={student.id}>
                      • {student.name} <span className="text-slate-400">({student.student_id})</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Topic Rendering */}
              {isManualMode ? (
                <GroupTopicButton group={group} isTeacher={true} />
              ) : group.topic ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 max-w-[200px]">
                  <span className="truncate" title={group.topic}>{group.topic}</span>
                  {group.topic_status === "pending" && <span className="ml-1 text-[10px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded">Pending</span>}
                </div>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 italic max-w-[200px] text-center">
                  No topic assigned
                </span>
              )}
              
              {/* Slides Link */}
              {group.slide_link && (
                <a
                  href={group.slide_link}
                  target="_blank"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
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