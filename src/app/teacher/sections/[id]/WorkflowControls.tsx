"use client";

import { useState } from "react";
import { Group, Section } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Compass,
  Shuffle,
  Users,
  MessageSquare,
  BookOpen,
  ListTodo,
  CheckCircle2,
  X,
  Loader2,
  Settings2
} from "lucide-react";

export default function WorkflowControls({
  section,
  groups,
}: {
  section: Section;
  groups: Group[];
}) {
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showProposalsModal, setShowProposalsModal] = useState(false);

  const [selectedMode, setSelectedMode] = useState<Section["topic_assignment_mode"]>(
    section.topic_assignment_mode || "manual"
  );
  
  const [topics, setTopics] = useState<string[]>(section.topics || []);
  const [topicInput, setTopicInput] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(section.allow_multiple_selection || false);

  const supabase = createClient();
  const router = useRouter();

  const proposedGroups = groups.filter((g) => g.topic && g.topic_status === "pending");
  const groupsWithoutTopics = groups.filter((g) => !g.topic);

  // --- SAVE MODE ---
  const handleSaveConfiguration = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("sections")
        .update({
          topic_assignment_enabled: true,
          topic_assignment_mode: selectedMode,
        })
        .eq("id", section.id);

      if (error) throw error;
      
      alert("Configuration saved successfully!");
      setShowAssignModal(false);
      router.refresh();
    } catch (e) {
      alert("Failed to save: " + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // --- MANAGE TOPICS LOGIC ---
  const handleAddTopic = async () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (topics.includes(trimmed)) return alert("Topic exists!");

    const newTopics = [...topics, trimmed];
    setTopics(newTopics);
    setTopicInput("");

    await supabase.from("sections").update({ topics: newTopics }).eq("id", section.id);
    router.refresh();
  };

  const handleRemoveTopic = async (topic: string) => {
    const newTopics = topics.filter((t) => t !== topic);
    setTopics(newTopics);

    await supabase.from("sections").update({ topics: newTopics }).eq("id", section.id);
    router.refresh();
  };

  const handleSaveStudentSelectConfig = async () => {
    await supabase.from("sections").update({ allow_multiple_selection: allowMultiple }).eq("id", section.id);
    alert("Saved student selection rules");
    router.refresh();
  };

  const handleRandomAssign = async () => {
    if (topics.length === 0) return alert("Please add topics first");
    if (groupsWithoutTopics.length === 0) return alert("All groups have topics!");

    setLoading(true);
    try {
      let availableTopics = [...topics];
      let successCount = 0;

      for (const group of groupsWithoutTopics) {
        if (availableTopics.length === 0) availableTopics = [...topics];
        const randomIndex = Math.floor(Math.random() * availableTopics.length);
        const selectedTopic = availableTopics[randomIndex];
        availableTopics.splice(randomIndex, 1);

        const { error } = await supabase
          .from("groups")
          .update({ topic: selectedTopic, topic_status: "approved" })
          .eq("id", group.id);

        if (!error) successCount++;
      }

      alert(`Randomly assigned topics to ${successCount} groups`);
      setShowManageModal(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // --- PROPOSALS LOGIC ---
  const handleApprove = async (groupId: string) => {
    setLoading(true);
    try {
      await supabase.from("groups").update({ topic_status: "approved" }).eq("id", groupId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (groupId: string) => {
    setLoading(true);
    try {
      await supabase.from("groups").update({ topic_status: "rejected", topic: null }).eq("id", groupId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Primary Workflow Actions */}
      <button
        onClick={() => setShowAssignModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
      >
        <Compass className="w-4 h-4" />
        Assign Topic
      </button>

      {/* Contextual Action based on Mode */}
      {section.topic_assignment_mode === "serial_random" ? (
        <button
          onClick={() => setShowManageModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          <Shuffle className="w-4 h-4" />
          Manage Topics
        </button>
      ) : null}

      {section.topic_assignment_mode === "student_select" ? (
        <button
          onClick={() => setShowManageModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          <ListTodo className="w-4 h-4" />
          Manage Topics
        </button>
      ) : null}

      {section.topic_assignment_mode === "proposal" ? (
        <button
          onClick={() => setShowProposalsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Review Proposals
          {proposedGroups.length > 0 && (
            <span className="bg-white text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {proposedGroups.length}
            </span>
          )}
        </button>
      ) : null}

      {/* --- ADD TOPIC ASSIGNMENT MODAL --- */}
      {showAssignModal && (
        <Modal onClose={() => setShowAssignModal(false)} title="Topic Assignment Workflow">
          <div className="space-y-4">
            <Option
              icon={BookOpen}
              title="Assign Manually"
              desc="Allow assigning topics manually individual to each group."
              selected={selectedMode === "manual"}
              onClick={() => setSelectedMode("manual")}
            />
            <Option
              icon={Shuffle}
              title="Give Random Topics"
              desc="Create topic list and system distribute them randomly."
              selected={selectedMode === "serial_random"}
              onClick={() => setSelectedMode("serial_random")}
            />
            <Option
              icon={Users}
              title="Students Select Topic"
              desc="Provide topics. Students pick their desired topic from list."
              selected={selectedMode === "student_select"}
              onClick={() => setSelectedMode("student_select")}
            />
            <Option
              icon={MessageSquare}
              title="Take Topic Proposal"
              desc="Students submit proposal, you approve or reject."
              selected={selectedMode === "proposal"}
              onClick={() => setSelectedMode("proposal")}
            />
            <button
              onClick={handleSaveConfiguration}
              disabled={loading}
              className="mt-6 w-full flex justify-center items-center gap-2 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </Modal>
      )}

      {/* --- MANAGE TOPICS MODAL --- */}
      {showManageModal && (
        <Modal onClose={() => setShowManageModal(false)} title="Manage Topics">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Add New Topic</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                  placeholder="E.g., Artificial Intelligence"
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTopic}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Add Topic
                </button>
              </div>
            </div>

            {/* Topics List */}
            {topics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Topics ({topics.length})</p>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                  {topics.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm font-medium">{idx + 1}.</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{t}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveTopic(t)} 
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Random Distribution Section */}
            {section.topic_assignment_mode === "serial_random" && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleRandomAssign}
                  disabled={loading || topics.length === 0}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
                  Assign Randomly To Groups
                </button>
              </div>
            )}

            {/* Student Select Settings Section */}
            {section.topic_assignment_mode === "student_select" && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Topic Selection Rules</p>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <input 
                      type="radio" 
                      name="selectionRule" 
                      checked={!allowMultiple}
                      onChange={() => setAllowMultiple(false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Single Group Per Topic</p>
                      <p className="text-xs text-slate-500">A topic disappears from list once picked by a group.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <input 
                      type="radio" 
                      name="selectionRule"
                      checked={allowMultiple}
                      onChange={() => setAllowMultiple(true)} 
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Multiple Groups Allowed</p>
                      <p className="text-xs text-slate-500">Several groups can present on the exact same topic.</p>
                    </div>
                  </label>
                </div>
                
                <button
                  onClick={handleSaveStudentSelectConfig}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
                >
                  Save Rules
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* --- REVIEW PROPOSALS MODAL --- */}
      {showProposalsModal && (
        <Modal onClose={() => setShowProposalsModal(false)} title="Review Proposals">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {proposedGroups.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No pending proposals to review.</p>
              </div>
            ) : (
              proposedGroups.map((group) => (
                <div key={group.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block px-2 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full mb-1">
                        Pending
                      </span>
                      <p className="text-slate-900 dark:text-white font-medium">Group {group.group_number}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Topic: <strong className="text-slate-800 dark:text-slate-200">{group.topic}</strong>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(group.id)}
                        disabled={loading}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(group.id)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

// Subcomponents
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Option({ icon: Icon, title, desc, selected, onClick }: { icon: React.ElementType, title: string, desc: string, selected: boolean, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
        selected ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-blue-600" : "border-slate-300 dark:border-slate-600"
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${selected ? "text-blue-600 dark:text-blue-500" : "text-slate-500 dark:text-slate-400"}`} />
          <h4 className={`font-semibold text-sm ${selected ? "text-blue-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
            {title}
          </h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  );
}