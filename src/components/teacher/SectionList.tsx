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
          Take First Course
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
          className="group block p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-sm"
        >
          {/* Section code badge */}
          <div className="flex items-start justify-between mb-3">
            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
              {section.section_code}
            </span>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/teacher/sections/${section.id}`;
                  }}
                  className="px-2 py-1 text-[11px] rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  title="Review topic proposals"
                >
                  Proposals {pendingCount}
                </button>
              )}
              <button
                onClick={(e) => copyLink(e, section.section_code)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-blue-600 focus:outline-none"
                title="Copy share link"
              >
                {copiedCode === section.section_code ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  section.is_locked
                    ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                    : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                }`}
              >
                {section.is_locked ? "Locked" : "Active"}
              </span>
            </div>
          </div>

          {/* Course info */}
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            {section.course?.course_name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {section.semester} · Batch {section.batch} · Section{" "}
            {section.section}
          </p>

          {/* Arrow on hover */}
          <div className="mt-4 text-xs text-slate-400 group-hover:text-blue-500 transition-colors flex items-center gap-1">
            Manage section
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </Link>
      );
      })}

    </div>
  );
}
