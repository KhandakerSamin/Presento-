"use client";

import { useState } from "react";

export type TopicAssignmentType = "manual" | "random" | "student_select" | "proposal";

export default function CreateSectionForm() {
  const [assignmentType, setAssignmentType] = useState<TopicAssignmentType>("manual");
  const [topics, setTopics] = useState<string>("");

  return (
    <div className="space-y-6">
      {/* ... other form fields would go here ... */}

      <div className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-medium">Topic Assignment Options</h3>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="topicAssignment" 
              value="manual"
              checked={assignmentType === "manual"}
              onChange={(e) => setAssignmentType(e.target.value as TopicAssignmentType)}
            />
            Assign manually
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="topicAssignment" 
              value="random"
              checked={assignmentType === "random"}
              onChange={(e) => setAssignmentType(e.target.value as TopicAssignmentType)}
            />
            Give random topic
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="topicAssignment" 
              value="student_select"
              checked={assignmentType === "student_select"}
              onChange={(e) => setAssignmentType(e.target.value as TopicAssignmentType)}
            />
            Student select topic (max 1 per group)
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="topicAssignment" 
              value="proposal"
              checked={assignmentType === "proposal"}
              onChange={(e) => setAssignmentType(e.target.value as TopicAssignmentType)}
            />
            Take topic proposal from student
          </label>
        </div>

        {(assignmentType === "random" || assignmentType === "student_select") && (
          <div className="mt-4 pt-4 border-t">
            <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1\">
              Available Topics (One per line)
            </label>
            <textarea
              className=\"w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400\"
              rows={5}
              placeholder=\"e.g.&#10;Machine Learning Basics&#10;React Hooks Deep Dive&#10;Database Optimization\"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
            <p className=\"text-xs text-slate-500 dark:text-slate-400 mt-1\">
              Add multiple topics separated by new lines.
            </p>
          </div>
        )}
      </div>

      <div className="pt-4">
        {/* Placeholder to indicate where a supabase insert call handling these state variables would go if this component handled submissions. In the actual app, submissions happen in teacher/sections/new/page.tsx. */}
        <button
          type="button"
          onClick={() => {
            const topicsArray = topics.split('\n').filter(Boolean);
            console.log("Supabase insert with:", { topic_assignment_type: assignmentType, topics: topicsArray });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Save Section Config
        </button>
      </div>
    </div>
  );
}

