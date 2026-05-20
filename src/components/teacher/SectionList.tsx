"use client";

import Link from "next/link";
import { type Section } from "@/types";
import { useState } from "react";
import { Check, Share2, ClipboardList } from "lucide-react";

export default function SectionList({
  sections,
  pendingTopicCounts,
}: {
  sections: Section[];
  pendingTopicCounts: Record<string, number>;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyLink = (e: React.MouseEvent, sectionCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    const link = `${window.location.origin}/section/${sectionCode}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(sectionCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
        <div className="text-slate-400 mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
          No sections yet
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Take a course to generate your first section
        </p>
        <Link
          href="/teacher/sections/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Add new course
        </Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => {
        const pendingCount = pendingTopicCounts[section.id] || 0;

        return (
        <Link
          key={section.id}
          href={`/teacher/sections/${section.id}`}
          className="group relative block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md overflow-hidden pb-2"
        >
          {/* Top colored border line */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="p-5">
            {/* Header info */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                    {section.course?.course_code || 'CODE'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                    section.is_locked
                      ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}>
                    {section.is_locked ? "Locked" : "Active"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight w-full hover:text-blue-600 transition-colors">
                  {section.course?.course_name || 'Course Name'}
                </h3>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg">
                <button
                  onClick={(e) => copyLink(e, section.section_code)}
                  className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-500 hover:text-blue-600 hover:shadow-sm focus:outline-none"
                  title="Copy join link"
                >
                  {copiedCode === section.section_code ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Tags area */}
            <div className="flex flex-wrap gap-2 mb-5">
              <div className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="font-medium">Batch {section.batch}</span>
              </div>
              <div className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="font-medium">Section {section.section}</span>
              </div>
              <div className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="text-slate-400">{section.semester}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4" />

            {/* Bottom Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Join Code</span>
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{section.section_code}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/teacher/sections/${section.id}`;
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <span className="flex w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {pendingCount} Pending
                  </button>
                )}
              </div>
            </div>
            
            {/* Action overlay text that appears on hover, giving a clear hint */}
            <div className="absolute inset-x-0 bottom-0 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 translate-y-full group-hover:translate-y-0 transition-transform flex justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
              Go to Section Dashboard &rarr;
            </div>
          </div>
        </Link>
      );
      })}

    </div>
  );
}
