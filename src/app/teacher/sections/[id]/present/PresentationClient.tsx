"use client";

import { useState } from "react";
import { Group, Section, Mark } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function PresentationClient({
  section,
  initialGroups,
  initialMarks
}: {
  section: Section;
  initialGroups: Group[];
  initialMarks: Mark[];
}) {
  const [groups] = useState(initialGroups);
  const [marks, setMarks] = useState(initialMarks);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groups.length > 0 ? groups[0].id : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const [criteriaScores, setCriteriaScores] = useState({ content: 0, delivery: 0, qa: 0 });

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const existingMark = marks.find(m => m.group_id === activeGroupId);

  // Load existing mark when group changes
  useState(() => {
     if (existingMark) {
         setCriteriaScores({
            content: existingMark.criteria_json.content ?? 0,
            delivery: existingMark.criteria_json.delivery ?? 0,
            qa: existingMark.criteria_json.qa ?? 0,
         });
     } else {
         setCriteriaScores({ content: 0, delivery: 0, qa: 0 });
     }
  });

  const handleGroupSelect = (id: string) => {
      setActiveGroupId(id);
      const mark = marks.find(m => m.group_id === id);
      if (mark) {
          setCriteriaScores({
            content: mark.criteria_json.content ?? 0,
            delivery: mark.criteria_json.delivery ?? 0,
            qa: mark.criteria_json.qa ?? 0,
         });
      } else {
          setCriteriaScores({ content: 0, delivery: 0, qa: 0 });
      }
      setError("");
  };

  const handleComplete = async () => {
      if (!activeGroup) return;
      setLoading(true);
      setError("");

      const total = criteriaScores.content + criteriaScores.delivery + criteriaScores.qa;
      
      let res;
      if (existingMark) {
         // Update
         res = await supabase.from("marks").update({
            criteria_json: criteriaScores,
            total
         }).eq("id", existingMark.id).select().single();
      } else {
         // Insert
         res = await supabase.from("marks").insert({
            group_id: activeGroup.id,
            criteria_json: criteriaScores,
            total
         }).select().single();
      }

      if (res.error) {
          setError(res.error.message);
      } else {
          // Update marks state
          const newMarks = existingMark 
            ? marks.map(m => m.id === res.data.id ? res.data : m)
            : [...marks, res.data];
          setMarks(newMarks);
          
          // Move to next group
          const idx = groups.findIndex(g => g.id === activeGroupId);
          if (idx !== -1 && idx < groups.length - 1) {
              handleGroupSelect(groups[idx + 1].id);
          }
      }
      setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
       <div className="w-full md:w-1/3 bg-white p-4 rounded-xl border">
          <h2 className="font-bold text-lg mb-4">Queue</h2>
          <div className="space-y-2">
             {groups.map((group) => {
                 const isCompleted = marks.some(m => m.group_id === group.id);
                 return (
                 <button 
                   key={group.id}
                   onClick={() => handleGroupSelect(group.id)}
                   className={`w-full text-left p-3 rounded border ${activeGroupId === group.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'} flex justify-between items-center`}
                 >
                    <span className="font-semibold text-slate-800">Group {group.group_number}</span>
                    {isCompleted && <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Done</span>}
                 </button>
             )})}
          </div>
       </div>
       
       <div className="w-full md:w-2/3 bg-white p-6 rounded-xl border">
          {activeGroup ? (
              <div>
                  <h2 className="font-bold text-2xl mb-2">Group {activeGroup.group_number}</h2>
                  <div className="mb-4">
                      {activeGroup.topic ? <p className="font-medium text-blue-600">Topic: {activeGroup.topic}</p> : <p className="text-slate-400 italic">No topic assigned</p>}
                      <div className="mt-2 text-sm text-slate-600">
                          {activeGroup.students?.map((s) => (
                             <span key={s.id} className="mr-3 bg-slate-100 px-2 py-1 rounded">{s.name} ({s.student_id})</span>
                          ))}
                      </div>
                  </div>
                  {activeGroup.slide_link ? (
                      <a href={activeGroup.slide_link} target="_blank" className="inline-block px-4 py-2 bg-blue-600 text-white rounded font-medium mb-6 mt-2">Open Slides &nearr;</a>
                  ) : (
                      <div className="bg-amber-100 text-amber-700 p-3 rounded mb-6 text-sm">No slides submitted yet.</div>
                  )}

                  <hr className="my-6 border-slate-200" />
                  
                  <h3 className="font-bold text-lg mb-4">Mark Panel</h3>
                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                  
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded">
                         <span className="font-medium text-slate-900 dark:text-white">Content / 10</span>
                         <input type="number" min="0" max="10" className="border border-slate-200 dark:border-slate-700 rounded p-1 w-20 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           value={criteriaScores.content} 
                           onChange={e => setCriteriaScores({...criteriaScores, content: Number(e.target.value)})} 
                         />
                     </div>
                     <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded">
                         <span className="font-medium text-slate-900 dark:text-white">Delivery / 10</span>
                         <input type="number" min="0" max="10" className="border border-slate-200 dark:border-slate-700 rounded p-1 w-20 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           value={criteriaScores.delivery} 
                           onChange={e => setCriteriaScores({...criteriaScores, delivery: Number(e.target.value)})} 
                         />
                     </div>
                     <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded">
                         <span className="font-medium text-slate-900 dark:text-white">Q&A / 10</span>
                         <input type="number" min="0" max="10" className="border border-slate-200 dark:border-slate-700 rounded p-1 w-20 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           value={criteriaScores.qa} 
                           onChange={e => setCriteriaScores({...criteriaScores, qa: Number(e.target.value)})} 
                         />
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6">
                      <div className="text-xl font-bold">Total: {criteriaScores.content + criteriaScores.delivery + criteriaScores.qa} / 30</div>
                      <button 
                         onClick={handleComplete} 
                         disabled={loading}
                         className="px-6 py-2 bg-green-600 text-white rounded font-bold"
                      >
                         {loading ? "Saving..." : "Save & Complete"}
                      </button>
                  </div>
              </div>
          ) : (
              <p className="text-slate-500">Select a group to start presenting.</p>
          )}
       </div>
    </div>
  );
}