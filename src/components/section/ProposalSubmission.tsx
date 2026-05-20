"use client";

import { useState } from "react";
import { Group, Section } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ProposalSubmission({
  section,
  group,
}: {
  section: Section;
  group: Group;
}) {
  const [topic, setTopic] = useState(group.topic || "");
  const [description, setDescription] = useState(group.topic_proposal_reason || "");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmitProposal = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("groups")
        .update({
          topic: trimmedTopic,
          topic_proposal_reason: description,
          topic_status: "pending",
        })
        .eq("id", group.id);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error: any) {
      alert("Error submitting proposal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          Proposal submitted! Teacher will review it soon.
        </p>
      </div>
    );
  }

  if (group.topic_status === "approved") {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
        <h3 className="font-medium text-slate-900 dark:text-white mb-1">Proposal Approved</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">{group.topic}</p>
      </div>
    );
  }

  if (group.topic_status === "rejected") {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <div className="text-red-600 dark:text-red-400 mb-2">✕</div>
        <h3 className="font-medium text-slate-900 dark:text-white mb-2">Proposal Rejected</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
          Previous proposal: {group.topic}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Please submit a new proposal below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Proposed Topic <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Artificial Intelligence in Healthcare"
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Brief Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why do you want to present on this topic?"
          rows={3}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
        />
      </div>

      {group.topic_status === "pending" && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2">
          <span className="text-amber-600 dark:text-amber-400 shrink-0">⏳</span>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Your proposal is pending review. You can update it below.
          </p>
        </div>
      )}

      <button
        onClick={handleSubmitProposal}
        disabled={loading || !topic.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Proposal
          </>
        )}
      </button>
    </div>
  );
}