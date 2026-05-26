"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Group, Section } from "@/types";
import { Loader2, Plus, AlertTriangle, CheckCircle2, Link as LinkIcon, Trash2, Users, Search, GraduationCap, ArrowRight, ExternalLink, Pencil, X, Check } from "lucide-react";
import StudentTopicSelector from "@/components/section/StudentTopicSelector";
import ProposalSubmission from "@/components/section/ProposalSubmission";
import Link from "next/link";

export default function ClientSectionView({
  section,
  initialGroups,
}: {
  section: Section;
  initialGroups: Group[];
}) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string>(initialGroups[0]?.id || "");
  const supabase = createClient();

  async function refreshGroups() {
    const { data } = await supabase
      .from("groups")
      .select("*, students(*)")
      .eq("section_id", section.id)
      .order("group_number");
    if (data) setGroups(data);
  }

  const filteredGroups = groups.filter(g => 
     g.group_number.toString().includes(searchQuery) ||
     g.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     g.students?.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.student_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeGroup = groups.find(g => g.id === activeGroupId) || filteredGroups[0];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm transition-transform hover:scale-105">P</Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Student Portal</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">Presento Learning</span>
          </div>
        </div>
        
        {/* Search Centered */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups, names, IDs or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white dark:placeholder-slate-400"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Mobile Search */}
        <div className="md:hidden relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white shadow-sm"
          />
        </div>

        {/* Section Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full tracking-wide uppercase">
                  {section.course?.department?.code || "COURSE"}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Batch {section.batch} • Section {section.section}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {section.course?.course_name || "Course"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4" /> {section.course?.course_code} • {section.semester}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 min-w-fit">
               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                 <Users className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Join Code</p>
                 <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{section.section_code}</p>
               </div>
            </div>
          </div>
        </div>

        {section.is_locked ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm">
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-1">Section Locked</h3>
            <p className="text-amber-700 dark:text-amber-500">This section has been locked by the teacher. You can no longer join groups or make changes.</p>
          </div>
        ) : (
          <div className="space-y-6">
             {/* Group Tabs Navigation */}
             <div className="flex items-center justify-between mb-2">
               <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Groups ({filteredGroups.length})</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400">Max {section.group_size || 5} members per group</p>
             </div>
             
             <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-none">
               {filteredGroups.map(g => (
                 <button
                   key={g.id}
                   onClick={() => setActiveGroupId(g.id)}
                   className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                     activeGroupId === g.id 
                       ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md' 
                       : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                   }`}
                 >
                   Group {g.group_number}
                   <span className={`text-xs px-2 py-0.5 rounded-full ${activeGroupId === g.id ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                     {(g.students || []).length}/{section.group_size || 5}
                   </span>
                 </button>
               ))}
               {filteredGroups.length === 0 && (
                 <div className="text-slate-500 dark:text-slate-400 text-sm py-2">No groups match your search.</div>
               )}
             </div>

             {/* Active Group Content */}
             {activeGroup && (
               <GroupCardView 
                 key={activeGroup.id} 
                 group={activeGroup} 
                 section={section} 
                 onRefresh={refreshGroups} 
                 allGroups={groups}
               />
             )}
          </div>
        )}
      </main>
    </div>
  );
}

function GroupCardView({ 
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
  const completionPercentage = Math.min(100, Math.round((existingStudents.length / maxMembers) * 100));
  const isTopicsLocked = completionPercentage < 80;

  const [activeTab, setActiveTab] = useState<"members" | "slide" | "topic">("members");

  const [memberInputs, setMemberInputs] = useState([{ name: "", studentId: "" }]);
  const [loading, setLoading] = useState<"join" | "slide" | null>(null);
  const [error, setError] = useState("");

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", studentId: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [slideLink, setSlideLink] = useState(group.slide_link || "");
  const [slideStatus, setSlideStatus] = useState<"idle" | "checking" | "warn" | "valid">("idle");
  
  const supabase = createClient();

  const handleEditStart = (s: any) => {
    setEditingStudentId(s.id);
    setEditForm({ name: s.name, studentId: s.student_id });
  };

  const handleEditCancel = () => {
    setEditingStudentId(null);
    setEditForm({ name: "", studentId: "" });
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim() || !editForm.studentId.trim()) {
      setError("Please fill in both name and Student ID.");
      return;
    }
    
    setLoading("join");
    setError("");

    const allRegisteredStudents = allGroups.flatMap(g => g.students || []);
    const otherStudents = allRegisteredStudents.filter(s => s.id !== editingStudentId);
    
    const alreadyRegistered = otherStudents.find(s => s.student_id.toLowerCase() === editForm.studentId.trim().toLowerCase());
    if (alreadyRegistered) {
      setError(`Student ID ${alreadyRegistered.student_id} is already registered in this section.`);
      setLoading(null);
      return;
    }
    
    const { error: editError } = await supabase
      .from("students")
      .update({ name: editForm.name.trim(), student_id: editForm.studentId.trim() })
      .eq("id", editingStudentId);

    if (editError) {
      setError(editError.message);
    } else {
      setEditingStudentId(null);
      await onRefresh();
    }
    setLoading(null);
  };

  const handleDeleteMember = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    setLoading("join");
    setError("");

    const { error: delError } = await supabase
      .from("students")
      .delete()
      .eq("id", deleteConfirmId);
      
    if (delError) {
      setError(delError.message);
    } else {
      await onRefresh();
    }
    setLoading(null);
    setDeleteConfirmId(null);
  };

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

    const alreadyRegistered = inputIds.find(id => allRegisteredStudents.some(s => s.student_id.toLowerCase() === id.toLowerCase()));
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
      await fetch(url, { method: "HEAD", mode: "no-cors" });
      setSlideStatus("valid");
    } catch {
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Mobile Internal Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <button 
          onClick={() => setActiveTab("members")}
          className={`flex-1 min-w-30 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "members" ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Members ({existingStudents.length}/{maxMembers})
        </button>
        <button 
          onClick={() => setActiveTab("slide")}
          className={`flex-1 min-w-30 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "slide" ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Slide Link
          {group.slide_link && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        </button>
        <button 
          onClick={() => setActiveTab("topic")}
          className={`flex-1 min-w-30 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "topic" ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Topic
          {group.topic && group.topic_status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        </button>
      </div>

      <div className="p-6 md:p-8">
         {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800/30 flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 shrink-0" />
               <p>{error}</p>
            </div>
         )}
         
         {/* MEMBERS TAB */}
         {activeTab === "members" && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {existingStudents.map((s, idx) => (
                 <div key={s.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-600 transition-colors relative group">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                       {idx + 1}
                    </div>
                    {editingStudentId === s.id ? (
                      <div className="flex-1 flex flex-col gap-2">
                        <input 
                          value={editForm.name}
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                          className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input 
                          value={editForm.studentId}
                          onChange={e => setEditForm({...editForm, studentId: e.target.value})}
                          className="w-full text-xs text-slate-500 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    ) : (
                      <div className="overflow-hidden flex-1 pr-16">
                         <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{s.student_id}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-1 py-1 rounded-lg z-10">
                      {editingStudentId === s.id ? (
                        <>
                          <button type="button" onClick={handleEditSave} className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-md" title="Save">
                            <Check className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={handleEditCancel} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => handleEditStart(s)} className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteMember(s.id)} className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                 </div>
               ))}
               {existingStudents.length === 0 && (
                 <div className="sm:col-span-2 lg:col-span-3 p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center">
                    <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No members have joined yet.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Be the first to join this group.</p>
                 </div>
               )}
             </div>

             {!isFull && (
               <form onSubmit={handleJoin} className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30 mt-8">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Add Members
                  </h5>
                  <div className="space-y-3">
                    {memberInputs.map((input, idx) => (
                       <div key={idx} className="flex gap-3 items-start">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <input 
                               required 
                               placeholder="Full Name" 
                               value={input.name} 
                               onChange={(e) => updateMember(idx, "name", e.target.value)}
                               className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                             />
                             <input 
                               required 
                               placeholder="Student ID (e.g. 241-35-182)" 
                               value={input.studentId} 
                               onChange={(e) => updateMember(idx, "studentId", e.target.value)}
                               className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                             />
                          </div>
                          {memberInputs.length > 1 && (
                             <button type="button" onClick={() => handleRemoveRow(idx)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Remove">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          )}
                       </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 pt-5 border-t border-blue-100 dark:border-slate-700/50">
                      {memberInputs.length < remainingSlots ? (
                         <button 
                           type="button" 
                           onClick={handleAddRow}
                           className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 focus:outline-none transition-colors"
                         >
                           <Plus className="w-4 h-4" /> Add another
                         </button>
                      ) : <span />}
                      
                      <button 
                        type="submit" 
                        disabled={loading === "join"}
                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                         {loading === "join" && <Loader2 className="w-4 h-4 animate-spin" />}
                         Join Group
                      </button>
                  </div>
               </form>
             )}
           </div>
         )}

         {/* SLIDE TAB */}
         {activeTab === "slide" && (
           <div className="max-w-2xl">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Submission Link</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Provide the link to your final presentation slides (Google Slides, OneDrive, Canva, etc).</p>
             
             {!existingStudents.length ? (
               <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                 <AlertTriangle className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                 <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Join the group first</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Only members can submit slides.</p>
               </div>
             ) : (
               <form onSubmit={handleSubmitSlide} className="space-y-5">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Presentation URL</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LinkIcon className="h-4 w-4 text-slate-400" />
                       </div>
                     <input
                       type="url"
                       required
                       placeholder="https://..."
                       value={slideLink}
                       onChange={(e) => {
                          setSlideLink(e.target.value);
                          setSlideStatus("idle");
                       }}
                       onBlur={handleLinkBlur}
                       className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm"
                     />
                  </div>
                  {/* Warning message */}
                  <div className="mt-3 text-sm">
                     <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 font-medium mb-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> 
                        <p>Ensure your link permissions are set to "Anyone with the link can view".</p>
                     </div>
                     {slideStatus === "checking" && <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-2"><Loader2 className="w-4 h-4 animate-spin" /> Verifying accessibility...</p>}
                     {slideStatus === "warn" && <p className="text-amber-600 dark:text-amber-500 flex items-center gap-1.5 mt-2"><AlertTriangle className="w-4 h-4" /> Couldn't verify access automatically.</p>}
                     {slideStatus === "valid" && <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2"><CheckCircle2 className="w-4 h-4" /> Link appears valid</p>}
                  </div>
                 </div>

                 <div className="flex items-center gap-3">
                   <button 
                      type="submit" 
                      disabled={loading === "slide"}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
                   >
                      {loading === "slide" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {group.slide_link ? "Update Link" : "Submit Slides"}
                   </button>
                   
                   {group.slide_link && (
                     <a 
                       href={group.slide_link}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                     >
                       Check Live <ExternalLink className="w-4 h-4" />
                     </a>
                   )}
                 </div>
               </form>
             )}
             
             {group.slide_link && (
               <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 p-4 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Slide Submitted successfully</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-500 truncate mt-0.5 font-medium">{group.slide_link}</p>
                    </div>
                  </div>
               </div>
             )}
           </div>
         )}

         {/* TOPIC TAB */}
         {activeTab === "topic" && (
           <div className="max-w-2xl">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Group Topic</h3>
               <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                 <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 w-16 overflow-hidden">
                   <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                 </div>
                 <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{completionPercentage}% Complete</span>
               </div>
             </div>
             
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
               {isTopicsLocked 
                 ? "You need at least 80% of members joined to select or propose a topic."
                 : "Manage your presentation topic depending on the course settings."}
             </p>

             {isTopicsLocked ? (
               <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
                 {/* Blurred content simulation */}
                 <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-3">
                   <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center">
                     <AlertTriangle className="w-6 h-6 text-amber-500" />
                   </div>
                   <div className="bg-white/90 dark:bg-slate-800/90 px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                     <p className="text-sm font-bold text-slate-800 dark:text-white">Locked until {Math.ceil(maxMembers * 0.8)} members join</p>
                   </div>
                 </div>
                 
                 {/* Dummy content behind blur */}
                 <div className="opacity-30 pointer-events-none">
                   <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-600 rounded mb-4"></div>
                   <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                   <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                 </div>
               </div>
             ) : (
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                 {group.topic ? (
                   <div className="mb-6">
                     <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Current Topic</h4>
                     <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                       <p className="text-lg font-bold text-slate-900 dark:text-white">{group.topic}</p>
                       <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          group.topic_status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          group.topic_status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                       }`}>
                         {group.topic_status || 'Manual'}
                       </span>
                     </div>
                   </div>
                 ) : (
                   <div className="mb-6">
                     <p className="text-sm text-slate-600 dark:text-slate-400 italic bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                       No topic assigned yet.
                     </p>
                   </div>
                 )}

                 {section.topic_assignment_mode === 'student_select' && (
                   <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                     <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Select a Topic</h4>
                     <StudentTopicSelector section={section} group={group} />
                   </div>
                 )}

                 {section.topic_assignment_mode === 'proposal' && (
                   <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                     <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Topic Proposal</h4>
                     <ProposalSubmission section={section} group={group} />
                   </div>
                 )}
               </div>
             )}
           </div>
         )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Remove Member</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to remove this member? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={loading === "join"}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading === "join" && <Loader2 className="w-4 h-4 animate-spin" />}
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}