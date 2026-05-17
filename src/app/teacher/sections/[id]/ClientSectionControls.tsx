"use client";

import { useState } from "react";
import { Group, Mark } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ClientSectionControls({
  sectionId,
  groups,
  marks
}: {
  sectionId: string;
  groups: Group[];
  marks: Mark[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  async function handleAssignTopics() {
      // Just a simple random logic for now, or allow simple prompt
      const topicInput = prompt("Enter topics separated by comma (e.g. AI, Blockchain, ML) for random assignment, or type 'DEFAULT' for simple numbering:");
      if (!topicInput) return;

      setLoading("topics");
      let topics = topicInput === "DEFAULT" 
          ? groups.map((_, i) => `Topic ${i + 1}`) 
          : topicInput.split(',').map(t => t.trim()).filter(Boolean);

      // Randomly assign to groups
      for (const group of groups) {
          const t = topics.length > 0 ? topics[Math.floor(Math.random() * topics.length)] : "Assigned Topic";
          await supabase.from("groups").update({ topic: t }).eq("id", group.id);
      }
      router.refresh();
      setLoading(null);
  }

  function handleExport() {
      // Generate CSV
      let csv = "Group Number,Topic,Student Name,Student ID,Content,Delivery,Q&A,Total\n";

      for (const group of groups) {
          const groupMark = marks.find(m => m.group_id === group.id);
          const members = group.students || [];

          if (members.length === 0) {
              const row = [
                  group.group_number,
                  `"${group.topic || ''}"`,
                  "", "",
                  groupMark?.criteria_json.content ?? 0,
                  groupMark?.criteria_json.delivery ?? 0,
                  groupMark?.criteria_json.qa ?? 0,
                  groupMark?.total ?? 0
              ].join(",");
              csv += row + "\n";
          } else {
              for (const [index, student] of members.entries()) {
                  // Only put group details on the first student row for grouping or put it in all
                  const row = [
                      group.group_number,
                      `"${group.topic || ''}"`,
                      `"${student.name}"`,
                      student.student_id,
                      groupMark?.criteria_json.content ?? 0,
                      groupMark?.criteria_json.delivery ?? 0,
                      groupMark?.criteria_json.qa ?? 0,
                      groupMark?.total ?? 0
                  ].join(",");
                  csv += row + "\n";
              }
          }
      }

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `section_${sectionId}_marks.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  }

  return (
      <>
        <button
            onClick={handleAssignTopics}
            disabled={loading === "topics"}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
            {loading === "topics" ? "Assigning..." : "🎲 Assign Topics"}
        </button>
        <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
            📥 Export CSV
        </button>
      </>
  );
}