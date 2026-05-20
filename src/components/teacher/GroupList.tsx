"use client";

import { Group, Section } from "@/types";
import GroupTopicButton from "./GroupTopicButton";

interface Props {
  groups: Group[];
  section: Section;
}

export default function GroupList({ groups, section }: Props) {
  const showTopicButtons = section.topic_assignment_enabled && section.topic_assignment_mode === "manual";

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
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                  G{group.group_number}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {group.students?.length || 0} members
                </span>
              </div>

              {group.students && group.students.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {group.students.map((student) => (
                    <p key={student.id}>
                      {student.name} <span className="text-slate-500">({student.student_id})</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {showTopicButtons && <GroupTopicButton group={group} isTeacher={true} />}
          </div>
        </div>
      ))}
    </div>
  );
}