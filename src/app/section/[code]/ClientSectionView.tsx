"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Group, Section } from "@/types";
import { Loader2, Plus, AlertTriangle, CheckCircle2, Link as LinkIcon, Trash2, Info } from "lucide-react";

export default function ClientSectionView({
  section,
  initialGroups,
}: {
  section: Section;
  initialGroups: Group[];
}) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const supabase = createClient();

  async function refreshGroups() {
    const { data } = await supabase
      .from("groups")
      .select("*, students(*)")
      .eq("section_id", section.id)
      .order("group_number");
    if (data) setGroups(data);
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Group Formation</h2>
        <p className="text-slate-600 mt-2 text-lg">
          Join a group below or submit your presentation materials. Each group holds up to {section.group_size || 5} members.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <GroupCard 
            key={group.id} 
            group={group} 
            section={section} 
            onRefresh={refreshGroups} 
            allGroups={groups}
          />
        ))}
      </div>
    </div>
  );
}

function GroupCard({ 
  group, 
  section, 
  onRefresh,
  allGroups 
}: { 
  group: Group; 
  section: Section; 
  onRefresh: () => Promise<void>;
  allGroups: Group[];
}) {
  const maxMembers = section.group_size || 5;
  const existingStudents = group.students || [];
  const remainingSlots = Math.max(0, maxMembers - existingStudents.length);

  const [memberInputs, setMemberInputs] = useState([{ name: "", studentId: "" }]);
  const [loading, setLoading] = useState<"join" | "slide" | null>(null);
  const [error, setError] = useState("");

  const [slideLink, setSlideLink] = useState(group.slide_link || "");
  const [slideStatus, setSlideStatus] = useState<"idle" | "checking" | "warn" | "valid">("idle");
  
  const supabase = createClient();

  const handleAddRow = () => {
    if (memberInputs.length < remainingSlots) {
      setMemberInputs([...memberInputs, { name: "", studentId: "" }]);
    }
  };

  const handleRemoveRow = (index: number) => {
    setMemberInputs(memberInputs.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: "name" | "studentId", value: string) => {
    const newInputs = [...memberInputs];
    newInputs[index][field] = value;
    setMemberInputs(newInputs);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("join");
    setError("");

    const validInputs = memberInputs.filter(m => m.name.trim() && m.studentId.trim());
    if (validInputs.length === 0) {
      setError("Please fill in at least one member details.");
      setLoading(null);
      return;
    }

    const allRegisteredStudents = allGroups.flatMap(g => g.students || []);
    
    // Check duplicates locally
    const inputIds = validInputs.map(m => m.studentId.trim());
    if (new Set(inputIds).size !== inputIds.length) {
      setError("Duplicate Student IDs in your input.");
      setLoading(null);
      return;
    }

    const alreadyRegistered = inputIds.find(id => allRegisteredStudents.some(s => s.student_id === id));
    if (alreadyRegistered) {
      setError(`Student ID ${alreadyRegistered} is already registered in this section.`);
      setLoading(null);
      return;
    }

    const { error: joinError } = await supabase.from("students").insert(
      validInputs.map(m => ({
        group_id: group.id,
        name: m.name.trim(),
        student_id: m.studentId.trim(),
      }))
    );

    if (joinError) {
      setError(joinError.message);
    } else {
      setMemberInputs([{ name: "", studentId: "" }]);
      await onRefresh();
    }
    setLoading(null);
  };

  const checkLinkAccess = async (url: string) => {
    if (!url.trim()) {
      setSlideStatus("idle");
      return;
    }
    
    try {
      new URL(url);
    } catch {
      setSlideStatus("warn");
      return;
    }

    setSlideStatus("checking");
    try {
      // Mocked HEAD request for simple URL validation & checking pseudo-access.
      await fetch(url, { method: "HEAD", mode: "no-cors" });
      setSlideStatus("valid");
    } catch (e) {
      setSlideStatus("warn");
    }
  };

  const handleLinkBlur = () => {
    if (slideLink !== group.slide_link) {
      checkLinkAccess(slideLink);
    }
  };

  const handleSubmitSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("slide");
    setError("");

    try {
      new URL(slideLink);
    } catch {
      setError("Please enter a valid URL");
      setLoading(null);
      return;
    }

    const { error: submitError } = await supabase
      .from("groups")
      .update({ slide_link: slideLink })
      .eq("id", group.id);

    if (submitError) {
      setError(submitError.message);
    } else {
      await onRefresh();
      setSlideStatus("idle");
    }
    setLoading(null);
  };

  const isFull = remainingSlots <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Group {group.group_number}</h3>
          {group.topic && <p className="text-blue-600 font-medium mt-1">{group.topic}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
            {existingStudents.length} / {maxMembers} Members
          </span>
          {group.slide_link && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Submitted
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left side: Members */}
           <div className="lg:col-span-7">
             <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">Group Members</h4>
             
             <ul className="space-y-3 mb-6">
               {existingStudents.map(s => (
                 <li key={s.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                       {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                       <p className="text-xs text-slate-500">{s.student_id}</p>
                    </div>
                 </li>
               ))}
               {existingStudents.length === 0 && (
                 <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No members have joined yet.</p>
               )}
             </ul>

             {!isFull && (
               <form onSubmit={handleJoin} className="space-y-4 bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
                  <h5 className="text-sm font-semibold text-blue-900">Add New Members</h5>
                  {memberInputs.map((input, idx) => (
                     <div key={idx} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                           <input 
                             required 
                             placeholder="Full Name" 
                             value={input.name} 
                             onChange={(e) => updateMember(idx, "name", e.target.value)}
                             className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                           <input 
                             required 
                             placeholder="Student ID" 
                             value={input.studentId} 
                             onChange={(e) => updateMember(idx, "studentId", e.target.value)}
                             className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                        {memberInputs.length > 1 && (
                           <button type="button" onClick={() => handleRemoveRow(idx)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove row">
                             <Trash2 className="w-5 h-5" />
                           </button>
                        )}
                     </div>
                  ))}
                  <div className="flex items-center justify-between mt-2">
                      {memberInputs.length < remainingSlots ? (
                         <button 
                           type="button" 
                           onClick={handleAddRow}
                           className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 focus:outline-none rounded"
                         >
                           <Plus className="w-4 h-4" /> Add another
                         </button>
                      ) : <span />}
                      
                      <button 
                        type="submit" 
                        disabled={loading === "join"}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                         {loading === "join" && <Loader2 className="w-4 h-4 animate-spin" />}
                         Join Group
                      </button>
                  </div>
               </form>
             )}
           </div>

           {/* Right side: Presentation/Slide */}
           <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col gap-6">
              
              {/* Topic Selection / Proposal form */}
              {isFull && (!group.topic || group.topic_status === 'rejected') && (section.topic_assignment_mode === 'student_select' || section.topic_assignment_mode === 'proposal') && (
                 <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                       {section.topic_assignment_mode === 'student_select' ? 'Select Topic' : 'Submit Topic Proposal'}
                    </h4>
                    {group.topic_status === 'rejected' && <p className="text-xs text-red-600 mb-2">Previous proposal was rejected. Submit a new one.</p>}
                    <form onSubmit={async (e) => {
                       e.preventDefault();
                       const form = e.target as HTMLFormElement;
                       const topicVal = (form.elements.namedItem('topicVal') as HTMLInputElement | HTMLSelectElement).value;
                       const reasonVal = (form.elements.namedItem('topicReason') as HTMLTextAreaElement | null)?.value || '';
                       
                       if (!topicVal) return;
                       
                       const updates: any = { topic: topicVal };
                       if (section.topic_assignment_mode === 'proposal') {
                         updates.topic_status = 'pending';
                         updates.topic_proposal_reason = reasonVal;
                       } else {
                         // auto approve for student_select
                         updates.topic_status = 'approved';
                       }
                       
                       setLoading("slide"); // reuse loading state
                       await supabase.from("groups").update(updates).eq("id", group.id);
                       await onRefresh();
                       setLoading(null);
                    }}>
                       {section.topic_assignment_mode === 'student_select' ? (
                          <div className="space-y-3">
                             <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block">Select a Topic</label>
                                <select name="topicVal" required className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none mb-3">
                                   <option value="">-- Choose a topic --</option>
                                   {(section.topics || []).map(t => {
                                      // hide topics if already taken (unless multiple selection is allowed)
                                      const taken = !section.allow_multiple_selection && allGroups.some(g => g.topic === t && g.id !== group.id);
                                      return <option key={t} value={t} disabled={taken}>{t} {taken ? '(Taken)' : ''}</option>;
                                   })}
                                </select>
                             </div>
                             {section.allow_multiple_selection && (
                                <p className="text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-1"><Info className="w-3 h-3" /> Multiple groups can select the same topic</p>
                             )}
                          </div>
                       ) : (
                          <div className="space-y-3">
                             <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block">Your Topic Proposal</label>
                                <input name="topicVal" required placeholder="Enter your topic..." className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none mb-3" />
                             </div>
                             <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block">Why this topic? (Optional)</label>
                                <textarea name="topicReason" placeholder="Explain your reasoning..." className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none" rows={3} />
                             </div>
                          </div>
                       )}
                       <button type="submit" disabled={loading === "slide"} className="w-full px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                          {loading === "slide" && <Loader2 className="w-4 h-4 animate-spin" />}
                          {section.topic_assignment_mode === 'student_select' ? 'Confirm Selection' : 'Submit Proposal'}
                       </button>
                    </form>
                 </div>
              )}

              {/* Status banner if pending approval */}
              {group.topic && group.topic_status === 'pending' && (
                 <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
                    <strong>Topic proposal pending:</strong> "{group.topic}"
                 </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">Slide Link</h4>
                
                <form onSubmit={handleSubmitSlide} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Presentation URL</label>
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <LinkIcon className="h-4 w-4 text-slate-400" />
                         </div>
                       <input
                         type="url"
                         required
                         placeholder="https://docs.google.com/..."
                         value={slideLink}
                         onChange={(e) => {
                            setSlideLink(e.target.value);
                            setSlideStatus("idle");
                         }}
                         onBlur={handleLinkBlur}
                         className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                       />
                    </div>
                    {/* Warning message */}
                    <div className="mt-2 text-xs">
                       <div className="flex items-start gap-1.5 text-amber-600 font-medium mb-1.5 bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> 
                          <p>Warning: Give public access before sharing, otherwise the teacher won't be able to open it.</p>
                       </div>
                       {slideStatus === "checking" && <p className="text-slate-500 flex items-center gap-1.5 mt-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying link access...</p>}
                       {slideStatus === "warn" && <p className="text-amber-600 flex items-center gap-1.5 mt-2"><AlertTriangle className="w-3.5 h-3.5" /> Couldn't verify auto-access. Make sure it's public.</p>}
                       {slideStatus === "valid" && <p className="text-emerald-600 flex items-center gap-1.5 mt-2"><CheckCircle2 className="w-3.5 h-3.5" /> Link formatted correctly and reachable</p>}
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading === "slide" || !existingStudents.length}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2"
                 >
                    {loading === "slide" && <Loader2 className="w-4 h-4 animate-spin" />}
                    {group.slide_link ? "Update Slide Link" : "Submit Link"}
                 </button>
                 {!existingStudents.length && (
                    <p className="text-xs text-center text-slate-500 mt-2">Join the group first before submitting</p>
                 )}
              </form>

              {group.slide_link && (
                 <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Submission</p>
                    <a 
                      href={group.slide_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all font-medium flex items-center gap-1.5"
                    >
                      <LinkIcon className="w-4 h-4 flex-shrink-0" />
                      View Slide
                    </a>
                 </div>
              )}
              </div>
           </div>
        </div>

        {error && (
           <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
           </div>
        )}
      </div>
    </div>
  );
}