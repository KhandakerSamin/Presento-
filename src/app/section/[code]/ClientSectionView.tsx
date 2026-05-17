"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Group, Section, Student } from "@/types";
import { useRouter } from "next/navigation";

export default function ClientSectionView({
  section,
  initialGroups,
}: {
  section: Section;
  initialGroups: Group[];
}) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  
  const [slideLink, setSlideLink] = useState("");
  const supabase = createClient();

  // Re-fetch groups locally, or use real-time in a fuller app. For now we just mutate.
  async function refreshGroups() {
    const { data } = await supabase
      .from("groups")
      .select("*, students(*)")
      .eq("section_id", section.id)
      .order("group_number");
    if (data) setGroups(data);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGroup) return;
    setLoading("join");
    setError("");

    // check if student ID already in this section
    const allStudents = groups.flatMap(g => g.students || []);
    if (allStudents.some(s => s.student_id === studentId)) {
        setError("Student ID is already registered in this section.");
        setLoading(null);
        return;
    }

    const { error: joinError } = await supabase.from("students").insert({
      group_id: selectedGroup.id,
      name,
      student_id: studentId,
    });

    if (joinError) {
      setError(joinError.message);
    } else {
      setJoinModalOpen(false);
      setName("");
      setStudentId("");
      await refreshGroups();
    }
    setLoading(null);
  }

  async function handleSubmitSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGroup) return;
    setLoading("submit");
    setError("");

    const { error: submitError } = await supabase
      .from("groups")
      .update({ slide_link: slideLink })
      .eq("id", selectedGroup.id);

    if (submitError) {
      setError(submitError.message);
    } else {
      setSubmitModalOpen(false);
      setSlideLink("");
      await refreshGroups();
    }
    setLoading(null);
  }

  function getStatus(group: Group) {
    if (group.slide_link) return "Submitted";
    if ((group.students?.length ?? 0) >= section.group_size) return "Full";
    return "Open";
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => {
          const status = getStatus(group);
          return (
            <div key={group.id} className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold">Group {group.group_number}</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-100">{status}</span>
              </div>
              <div className="text-sm space-y-1 mb-4 text-slate-600 min-h-[4rem]">
                {group.topic && <p className="font-medium text-blue-600">Topic: {group.topic}</p>}
                {group.students?.map(s => (
                  <p key={s.id}>- {s.name} ({s.student_id})</p>
                ))}
                {(!group.students || group.students.length === 0) && <p>No members yet</p>}
                <p className="text-xs mt-2">{group.students?.length || 0} / {section.group_size} members</p>
              </div>

              <div className="flex gap-2">
                {status !== "Full" && status !== "Submitted" && (
                  <button 
                    onClick={() => { setSelectedGroup(group); setJoinModalOpen(true); }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Join
                  </button>
                )}
                {group.students && group.students.length > 0 && status !== "Submitted" && (
                   <button 
                    onClick={() => { setSelectedGroup(group); setSubmitModalOpen(true); }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    Submit Slide
                  </button>
                 )}
                 {status === "Submitted" && (
                     <a href={group.slide_link!} target="_blank" className="flex-1 py-2 text-center border border-slate-200 rounded-lg text-sm">
                         View Slide
                     </a>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Join Modal */}
      {joinModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Join Group {selectedGroup.group_number}</h3>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Student ID</label>
                <input required value={studentId} onChange={e=>setStudentId(e.target.value)} className="w-full border rounded p-2" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setJoinModalOpen(false)} className="flex-1 p-2 bg-slate-100 rounded">Cancel</button>
                <button type="submit" disabled={loading==="join"} className="flex-1 p-2 bg-blue-600 text-white rounded">{loading === "join" ? "..." : "Join"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Slide Modal */}
      {submitModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Submit Slide for Group {selectedGroup.group_number}</h3>
            <form onSubmit={handleSubmitSlide} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Slide URL</label>
                <input type="url" required value={slideLink} onChange={e=>setSlideLink(e.target.value)} className="w-full border rounded p-2" placeholder="https://..." />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setSubmitModalOpen(false)} className="flex-1 p-2 bg-slate-100 rounded">Cancel</button>
                <button type="submit" disabled={loading==="submit"} className="flex-1 p-2 bg-green-600 text-white rounded">{loading === "submit" ? "..." : "Submit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}