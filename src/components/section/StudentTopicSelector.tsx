"use client";

import { useState } from "react";
import { Group, Section } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function StudentTopicSelector({
  section,
  group,
}: {
  section: Section;
  group: Group;
}) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(group.topic || null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const availableTopics = section.topics || [];
  const isTopicTaken = (topic: string) => {
    if (section.allow_multiple_selection) return false;
    return topic !== group.topic && section.topics?.includes(topic);
  };

  const handleSelectTopic = async () => {
    if (!selectedTopic) {
      alert("Please select a topic");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("groups")
        .update({
          topic: selectedTopic,
          topic_status: "approved",
        })
        .eq("id", group.id);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      alert("Error selecting topic: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          Topic saved successfully!
        </p>
      </div>
    );
  }

  if (group.topic && section.allow_multiple_selection === false) {
    return (
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
        <h3 className="font-medium text-slate-900 dark:text-white mb-1">Topic Selected</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{group.topic}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Your topic has been locked. Only one group can present on this topic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
          Choose Your Topic
        </label>
        <div className="space-y-2">
          {availableTopics.length > 0 ? (
            availableTopics.map((topic) => {
              const isTaken = isTopicTaken(topic);
              const isSelected = selectedTopic === topic;

              return (
                <label
                  key={topic}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : isTaken
                      ? "border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="topic"
                    value={topic}
                    checked={isSelected}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={isTaken}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {topic}
                    </p>
                    {isTaken && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Already taken by another group
                      </p>
                    )}
                  </div>
                </label>
              );
            })
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No topics available yet. Wait for teacher to add topics.
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSelectTopic}
        disabled={loading || !selectedTopic || availableTopics.length === 0}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Save Topic Selection
          </>
        )}
      </button>
    </div>
  );
}