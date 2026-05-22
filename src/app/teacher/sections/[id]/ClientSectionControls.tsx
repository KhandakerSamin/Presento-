"use client";

import { useMemo, useState } from "react";
import { Group, Mark, Section } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ClientSectionControls({
  section,
  groups,
  marks
}: {
  section: Section;
  groups: Group[];
  marks: Mark[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<"assign" | "manual" | "proposals" | null>(null);
  const [assignmentType, setAssignmentType] = useState<"manual" | "random" | "student_select" | "proposal">(
    (section as Section & { topic_assignment_mode?: string, topic_assignment_type?: string }).topic_assignment_mode || 
    (section as Section & { topic_assignment_mode?: string, topic_assignment_type?: string }).topic_assignment_type || 
    "manual"
  );
  const [topicsInput, setTopicsInput] = useState("");
  const [topics, setTopics] = useState<string[]>(section.topics || []);
  const supabase = createClient();
  const router = useRouter();
  
  const hasPendingProposals = groups.some((group) => group.topic_status === "pending");
  const groupsWithoutTopics = groups.filter(g => !g.topic);
  const availableTopicsCount = useMemo(() => topics.length, [topics]);

  async function handleSaveAssignment() {
    setLoading("assignment");
    try {
      // Validation based on assignment type
      if (assignmentType === "random" || assignmentType === "student_select") {
        if (topics.length === 0) {
          alert("Please add at least one topic for this mode");
          setLoading(null);
          return;
        }
      }

      const { error } = await supabase
        .from("sections")
        .update({
          topic_assignment_type: assignmentType,
          topics: (assignmentType === "random" || assignmentType === "student_select") ? topics : [],
        })
        .eq("id", section.id);

      if (error) {
        console.error("Error saving assignment:", error);
        alert("Failed to save assignment: " + error.message);
        setLoading(null);
        return;
      }

      alert("Topic assignment mode saved successfully!");
      setLoading(null);
      setShowModal(null);
      router.refresh();
    } catch (e) {
      console.error("Error:", e);
      alert("An error occurred while saving");
      setLoading(null);
    }
  }

  async function handleRandomAssign() {
    if (topics.length === 0) {
      alert("Please add topics first before assigning");
      return;
    }

    if (groupsWithoutTopics.length === 0) {
      alert("All groups already have topics assigned");
      return;
    }

    setLoading("topics");
    try {
      let availableTopics = [...topics];
      let successCount = 0;

      for (const group of groupsWithoutTopics) {
        if (availableTopics.length === 0) {
          availableTopics = [...topics]; // recycle topics when we run out
        }

        const randomIndex = Math.floor(Math.random() * availableTopics.length);
        const selectedTopic = availableTopics[randomIndex];
        availableTopics.splice(randomIndex, 1);

        const { error } = await supabase
          .from("groups")
          .update({ topic: selectedTopic, topic_status: "approved" })
          .eq("id", group.id);

        if (!error) {
          successCount++;
        }
      }

      alert(`Successfully assigned topics to ${successCount} groups`);
      setLoading(null);
      router.refresh();
    } catch (e) {
      console.error("Error during random assignment:", e);
      alert("An error occurred during random assignment");
      setLoading(null);
    }
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
              for (const student of members) {
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
      a.download = `section_${section.section_code}_marks.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  }

  const topicMode = (section as Section & { topic_assignment_mode?: string, topic_assignment_type?: string }).topic_assignment_mode || 
    (section as Section & { topic_assignment_mode?: string, topic_assignment_type?: string }).topic_assignment_type;

  return (
    <>
      {/* Main Buttons */}
      <button
        onClick={() => setShowModal("assign")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        🧭 Assign Topic
      </button>

      {/* Mode-specific action buttons */}
      {topicMode === "random" && (
        <button
          onClick={handleRandomAssign}
          disabled={loading === "topics" || topics.length === 0}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          title={topics.length === 0 ? "Please configure topics first" : ""}
        >
          {loading === "topics" ? "Assigning..." : `🎲 Random Assign (${groupsWithoutTopics.length} groups)`}
        </button>
      )}

      {topicMode === "manual" && (
        <button
          onClick={() => setShowModal("manual")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          ✏️ Manage Topics ({groupsWithoutTopics.length} pending)
        </button>
      )}

      {topicMode === "student_select" && (
        <button
          disabled={topics.length === 0}
          className="px-4 py-2 bg-purple-600 opacity-50 cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          title="Students will select topics after group reaches 5 members"
        >
          👥 Student Selection Active
        </button>
      )}

      {(((section as any).topic_assignment_mode === "proposal" || (section as any).topic_assignment_type === "proposal") || hasPendingProposals) && (
        <button
          onClick={() => setShowModal("proposals")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          📋 Review Proposals ({groups.filter(g => g.topic_status === "pending").length})
        </button>
      )}

      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        📥 Export CSV
      </button>

      {/* Topic Assignment Modal */}
      {showModal === "assign" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure topic assignment for</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {section.section_code}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(null)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Mode 1: Manual Assignment */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setAssignmentType("manual")}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="topicAssignment"
                      value="manual"
                      checked={assignmentType === "manual"}
                      onChange={() => setAssignmentType("manual")}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        🎯 Assign Manually
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        You manually assign a topic to each group individually. Full control over topic distribution.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Mode 2: Random Assignment */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setAssignmentType("random")}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="topicAssignment"
                      value="random"
                      checked={assignmentType === "random"}
                      onChange={() => setAssignmentType("random")}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        🎲 Give Random Topic
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Add multiple topics (5, 10, 15, etc.), and topics are randomly distributed to groups.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Mode 3: Student Select */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setAssignmentType("student_select")}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="topicAssignment"
                      value="student_select"
                      checked={assignmentType === "student_select"}
                      onChange={() => setAssignmentType("student_select")}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        👥 Student Select Topic
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        You provide topics. Students can select one from dropdown after their group reaches 5 members. One topic per group.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Mode 4: Topic Proposal */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setAssignmentType("proposal")}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="topicAssignment"
                      value="proposal"
                      checked={assignmentType === "proposal"}
                      onChange={() => setAssignmentType("proposal")}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        💡 Take Topic Proposal from Student
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Students propose their own topic after group creation. You can approve or reject proposals from the dashboard.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Topic Input Section for modes 2 and 3 */}
                {(assignmentType === "random" || assignmentType === "student_select") && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        ✏️ Configure Topics
                      </label>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                        {availableTopicsCount} topic{availableTopicsCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={topicsInput}
                        onChange={(e) => setTopicsInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const trimmed = topicsInput.trim();
                            if (trimmed && !topics.includes(trimmed)) {
                              setTopics((prev) => [...prev, trimmed]);
                              setTopicsInput("");
                            }
                          }
                        }}
                        placeholder="Enter a topic and press Enter or click Add"
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = topicsInput.trim();
                          if (!trimmed) {
                            alert("Please enter a topic");
                            return;
                          }
                          if (topics.includes(trimmed)) {
                            alert("This topic already exists");
                            return;
                          }
                          setTopics((prev) => [...prev, trimmed]);
                          setTopicsInput("");
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
                      >
                        Add Topic
                      </button>
                    </div>

                    {topics.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Added topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {topics.map((topic, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setTopics((prev) => prev.filter((t) => t !== topic))}
                              className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              title="Click to remove"
                            >
                              {topic} ✕
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      💡 Tip: Add as many topics as you need (5, 10, 15, etc.). For {groupsWithoutTopics.length} group{groupsWithoutTopics.length !== 1 ? 's' : ''}, consider adding at least {Math.ceil(groupsWithoutTopics.length / 2)} topics.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {assignmentType === "manual" && "You can manage topics after saving"}
                {assignmentType === "random" && `${groupsWithoutTopics.length} group(s) will be assigned random topics`}
                {assignmentType === "student_select" && `Students will see ${availableTopicsCount} topic options when group reaches 5 members`}
                {assignmentType === "proposal" && "Students will propose topics during group creation"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignment}
                  disabled={loading === "assignment"}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {loading === "assignment" ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Topics Modal - for Manual Assignment */}
      {showModal === "manual" && (
        <ManageTopicsModal
          groups={groups}
          section={section}
          onClose={() => setShowModal(null)}
        />
      )}

      {/* Review Proposals Modal */}
      {showModal === "proposals" && (
        <ReviewProposalsModal
          groups={groups}
          section={section}
          onClose={() => setShowModal(null)}
        />
      )}
    </>
  );
}

function ManageTopicsModal({
  groups,
  section,
  onClose,
}: {
  groups: Group[];
  section: Section;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTopic, setTempTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const groupsWithoutTopics = groups.filter((g) => !g.topic);

  async function handleSave(id: string) {
    if (!tempTopic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("groups")
        .update({ topic: tempTopic, topic_status: "approved" })
        .eq("id", id);

      if (error) {
        alert("Failed to save topic: " + error.message);
      } else {
        setEditingId(null);
        router.refresh();
      }
    } catch {
      alert("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Topics Manually</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{section.section_code} • {groupsWithoutTopics.length} group(s) pending</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {groups.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No groups yet</p>
          )}

          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                    G{g.group_number}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {g.students?.length || 0} members
                  </span>
                </div>

                {editingId === g.id ? (
                  <input
                    type="text"
                    value={tempTopic}
                    onChange={(e) => setTempTopic(e.target.value)}
                    placeholder="Enter topic name"
                    autoFocus
                    className="mt-2 w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-medium mt-2 text-slate-900 dark:text-white">
                    {g.topic ? (
                      <>
                        <span className="text-slate-500 dark:text-slate-400">Topic: </span>
                        <span className="text-blue-600 dark:text-blue-400">{g.topic}</span>
                        <span
                          className={`ml-2 text-xs px-2 py-1 rounded-full ${
                            g.topic_status === "approved"
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {g.topic_status === "approved" ? "✓ Approved" : "⏳ Pending"}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">No topic assigned</span>
                    )}
                  </p>
                )}
              </div>

              <div className="ml-4">
                {editingId === g.id ? (
                  <button
                    onClick={() => handleSave(g.id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(g.id);
                      setTempTopic(g.topic || "");
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    {g.topic ? "Edit" : "Assign"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewProposalsModal({
  groups,
  section,
  onClose,
}: {
  groups: Group[];
  section: Section;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleStatus(id: string, status: "approved" | "rejected") {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("groups")
        .update({ topic_status: status })
        .eq("id", id);

      if (error) {
        alert("Failed to update proposal: " + error.message);
      } else {
        router.refresh();
      }
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const proposedGroups = groups.filter((g) => g.topic && g.topic_status === "pending");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Topic Proposals</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{section.section_code} • {proposedGroups.length} proposal(s) pending</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {proposedGroups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500 dark:text-slate-400">✓ No pending proposals</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All proposals have been reviewed</p>
            </div>
          )}

          {proposedGroups.map((g) => (
            <div
              key={g.id}
              className="p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400">
                      G{g.group_number}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300">
                      {g.students?.length || 0} members
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">💡 Proposed Topic:</p>
                  <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white break-word">
                      {g.topic}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    💬 Students&apos; Reasoning: <span className="italic">{g.topic_proposal_reason || "No reason provided"}</span>
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleStatus(g.id, "approved")}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    title="Approve this topic"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleStatus(g.id, "rejected")}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    title="Reject this proposal"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}