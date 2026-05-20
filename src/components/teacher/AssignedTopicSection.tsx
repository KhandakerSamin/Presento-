"use client";

import { useEffect, useState } from "react";
import { Group, Section } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Shuffle, 
  Users, 
  MessageSquare,
  Loader2
} from "lucide-react";

interface Props {
  section: Section;
  groups: Group[];
}

export default function AssignedTopicSection({ section, groups }: Props) {
  const [enabled, setEnabled] = useState(section.topic_assignment_enabled || false);
  const [mode, setMode] = useState<"manual" | "serial_random" | "student_select" | "proposal" | null>(
    section.topic_assignment_mode || null
  );
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Save checkbox state to localStorage and database
  useEffect(() => {
    const handleSave = async () => {
      if (!loading) {
        setLoading(true);
        try {
          await supabase
            .from("sections")
            .update({
              topic_assignment_enabled: enabled,
              topic_assignment_mode: mode,
            })
            .eq("id", section.id);
          
          localStorage.setItem(`topic-assignment-${section.id}`, JSON.stringify({ enabled, mode }));
          router.refresh();
        } catch (e) {
          console.error("Error saving assignment state:", e);
        } finally {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(handleSave, 500);
    return () => clearTimeout(timer);
  }, [enabled, mode]);

  const toggleEnabled = () => {
    setEnabled(!enabled);
    if (!enabled) {
      setMode(null); // Reset mode when unchecked
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden">
      {/* Left side: Checkbox */}
      <div className="flex">
        <div className="w-full sm:w-1/3 border-r border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={enabled}
              onChange={toggleEnabled}
              disabled={loading}
              className="w-5 h-5 text-blue-600 cursor-pointer rounded border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 mt-1"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Assigned Topic
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Enable topic assignment for this section
              </p>
              {loading && (
                <div className="flex items-center gap-2 mt-3">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  <span className="text-xs text-slate-500">Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Options (only show when enabled) */}
        {enabled && (
          <div className="flex-1 p-6 space-y-3">

          {/* Option 1: Manual Assignment */}
            <OptionCard
              icon={BookOpen}
              title="Option 1: Manual Assignment"
              description="All groups get an 'Add Topic' button"
              selected={mode === "manual"}
              onClick={() => setMode("manual")}
              disabled={loading}
            />

            {/* Option 2: Serial Add & Random Distribution */}
            <OptionCard
              icon={Shuffle}
              title="Option 2: Serial Add & Random"
              description="Add topics one by one, then randomly distribute to 10 groups"
              selected={mode === "serial_random"}
              onClick={() => setMode("serial_random")}
              disabled={loading}
            />

            {/* Option 3: Student Selection */}
            <OptionCard
              icon={Users}
              title="Option 3: Student Selection"
              description="Students select from dropdown with single or multiple selection options"
              selected={mode === "student_select"}
              onClick={() => setMode("student_select")}
              disabled={loading}
            />

            {/* Option 4: Review Proposals */}
            <OptionCard
              icon={MessageSquare}
              title="Option 4: Review Proposals"
              description="Students submit topic proposals, you approve/reject"
              selected={mode === "proposal"}
              onClick={() => setMode("proposal")}
              disabled={loading}
            />

            {/* Render selected mode UI */}
            {mode && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {mode === "manual" && <ManualAssignmentUI section={section} groups={groups} />}
                {mode === "serial_random" && <SerialRandomUI section={section} groups={groups} />}
                {mode === "student_select" && <StudentSelectionUI section={section} groups={groups} />}
                {mode === "proposal" && <ProposalReviewUI section={section} groups={groups} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OptionCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
        selected
          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950"
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="radio"
        checked={selected}
        onChange={onClick}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 mt-0.5"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function ManualAssignmentUI({ section, groups }: { section: Section; groups: Group[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const groupsWithoutTopics = groups.filter((g) => !g.topic);

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
        <p>Each group will have an <strong>"Add Topic"</strong> button. Teachers can manually assign topics to each group individually.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-xl font-bold text-slate-900 dark:text-white">{groups.length}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Groups</p>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{groupsWithoutTopics.length}</div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Without Topics</p>
        </div>
      </div>

      <button
        onClick={async () => {
          setLoading(true);
          try {
            const { error } = await supabase
              .from("sections")
              .update({ topic_assignment_mode: "manual" })
              .eq("id", section.id);
            if (!error) router.refresh();
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? "Activating..." : "Activate Manual Assignment"}
      </button>
    </div>
  );
}

function SerialRandomUI({ section, groups }: { section: Section; groups: Group[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>(section.topics || []);
  const [topicInput, setTopicInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTopic = async () => {
    const trimmed = topicInput.trim();
    if (!trimmed) {
      alert("Please enter a topic");
      return;
    }
    if (topics.includes(trimmed)) {
      alert("Topic already exists");
      return;
    }

    const newTopics = [...topics, trimmed];
    setTopics(newTopics);
    setTopicInput("");

    await supabase
      .from("sections")
      .update({ topics: newTopics })
      .eq("id", section.id);
  };

  const handleRemoveTopic = async (topic: string) => {
    const newTopics = topics.filter((t) => t !== topic);
    setTopics(newTopics);

    await supabase
      .from("sections")
      .update({ topics: newTopics })
      .eq("id", section.id);
  };

  const handleRandomAssign = async () => {
    if (topics.length === 0) {
      alert("Please add at least one topic first");
      return;
    }

    setLoading(true);
    try {
      const groupsToAssign = groups.filter((g) => !g.topic).slice(0, 10);

      for (const group of groupsToAssign) {
        // eslint-disable-next-line
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        await supabase
          .from("groups")
          .update({ topic: randomTopic, topic_status: "approved" })
          .eq("id", group.id);
      }

      alert(`Randomly assigned topics to ${groupsToAssign.length} groups`);
      router.refresh();
    } catch (e) {
      alert("Error during random assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm text-purple-700 dark:text-purple-300">
        <p>Add topics serially, then click button to distribute to up to 10 groups randomly.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-white">Add Topics</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddTopic();
            }}
            placeholder="Enter topic"
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddTopic}
            className="px-3 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {topics.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Topics ({topics.length}):</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleRemoveTopic(topic)}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                {topic} ×
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleRandomAssign}
        disabled={loading || topics.length === 0}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? "Assigning..." : "Give All Groups Randomly (up to 10)"}
      </button>
    </div>
  );
}

function StudentSelectionUI({ section, groups }: { section: Section; groups: Group[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>(section.topics || []);
  const [topicInput, setTopicInput] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(section.allow_multiple_selection || false);
  const [loading, setLoading] = useState(false);

  const handleAddTopic = async () => {
    const trimmed = topicInput.trim();
    if (!trimmed) {
      alert("Please enter a topic");
      return;
    }
    if (topics.includes(trimmed)) {
      alert("Topic already exists");
      return;
    }

    const newTopics = [...topics, trimmed];
    setTopics(newTopics);
    setTopicInput("");

    await supabase
      .from("sections")
      .update({ topics: newTopics })
      .eq("id", section.id);
  };

  const handleRemoveTopic = async (topic: string) => {
    const newTopics = topics.filter((t) => t !== topic);
    setTopics(newTopics);

    await supabase
      .from("sections")
      .update({ topics: newTopics })
      .eq("id", section.id);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await supabase
        .from("sections")
        .update({
          topics,
          allow_multiple_selection: allowMultiple,
          topic_assignment_mode: "student_select",
        })
        .eq("id", section.id);

      alert("Settings saved! Students can now select topics.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 text-sm text-cyan-700 dark:text-cyan-300">
        <p>Students will select topics from dropdown after their group is created.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-white">Add Available Topics</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddTopic();
            }}
            placeholder="Enter topic"
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handleAddTopic}
            className="px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {topics.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Topics ({topics.length}):</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleRemoveTopic(topic)}
                className="px-3 py-1.5 text-xs font-medium bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded-full hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors"
              >
                {topic} ×
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => setAllowMultiple(e.target.checked)}
            className="w-4 h-4 text-cyan-600 rounded"
          />
          Allow Multiple Selections
        </label>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {allowMultiple
            ? "Multiple groups can select same topic"
            : "Each group selects one topic (multiple groups can pick same topic)"}
        </p>
      </div>

      <button
        onClick={handleSaveSettings}
        disabled={loading || topics.length === 0}
        className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? "Saving..." : "Set Topics for Student Selection"}
      </button>
    </div>
  );
}

function ProposalReviewUI({ section, groups }: { section: Section; groups: Group[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async (groupId: string) => {
    setLoading(true);
    try {
      await supabase
        .from("groups")
        .update({ topic_status: "approved" })
        .eq("id", groupId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (groupId: string) => {
    setLoading(true);
    try {
      await supabase
        .from("groups")
        .update({ topic_status: "rejected" })
        .eq("id", groupId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const proposedGroups = groups.filter((g) => g.topic && g.topic_status === "pending");
  const approvedGroups = groups.filter((g) => g.topic_status === "approved");

  return (
    <div className="space-y-3">
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
        <p>Students will propose topics after group creation. Review their proposals and approve or reject them.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-lg font-bold text-slate-900 dark:text-white">{groups.length}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total</p>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{proposedGroups.length}</div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Pending</p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{approvedGroups.length}</div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">Approved</p>
        </div>
      </div>

      {proposedGroups.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Pending Proposals</p>
          {proposedGroups.map((group) => (
            <div
              key={group.id}
              className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    Group {group.group_number} ({group.students?.length || 0} members)
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <strong>Proposal:</strong> {group.topic}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(group.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(group.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {proposedGroups.length === 0 && groups.length > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center text-sm text-slate-600 dark:text-slate-400">
          No pending proposals. Waiting for student proposals.
        </div>
      )}
    </div>
  );
}