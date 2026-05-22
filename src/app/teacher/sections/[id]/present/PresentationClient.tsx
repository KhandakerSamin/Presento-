"use client";

import { useState, useEffect } from "react";
import { Group, Section, Mark } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  Users,
  Save,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Presentation,
  Plus,
  Trash2
} from "lucide-react";

interface Criterion {
  id: string;
  name: string;
  maxMark: number;
}

interface MarkingConfig {
  useCriteria: boolean;
  maxTotal: number;
  criteria: Criterion[];
}

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
  const [showConfig, setShowConfig] = useState(false);

  // Default Config state
  const [config, setConfig] = useState<MarkingConfig>({
    useCriteria: true,
    maxTotal: 8,
    criteria: [
      { id: "c1", name: "Content", maxMark: 10 },
      { id: "c2", name: "Delivery", maxMark: 10 },
      { id: "c3", name: "Q&A", maxMark: 5 }
    ]
  });

  const supabase = createClient();

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem(`marking_config_${section.id}`);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
  }, [section.id]);

  const saveConfig = (newConfig: MarkingConfig) => {
    setConfig(newConfig);
    localStorage.setItem(`marking_config_${section.id}`, JSON.stringify(newConfig));
    setShowConfig(false);
  };

  // student_id -> criteria_id -> score
  const [studentScores, setStudentScores] = useState<Record<string, Record<string, number>>>({});

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const existingMark = marks.find(m => m.group_id === activeGroupId);

  // Load existing mark when group changes
  useEffect(() => {
    if (existingMark && existingMark.criteria_json) {
      const data = existingMark.criteria_json as any;
      if (data.studentMarks) {
        // new format
        const loadedScores: Record<string, Record<string, number>> = {};
        for (const studentId in data.studentMarks) {
           loadedScores[studentId] = data.studentMarks[studentId].scores || {};
        }
        setStudentScores(loadedScores);
        return;
      }
    }
    // initialize empty
    setStudentScores({});
  }, [activeGroupId, existingMark]);

  const handleGroupSelect = (id: string) => {
      setActiveGroupId(id);
      setError("");
  };

  const handleScoreChange = (studentId: string, criteriaId: string, value: string) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    
    // validate against max
    if (config.useCriteria) {
      const crit = config.criteria.find(c => c.id === criteriaId);
      if (crit && num > crit.maxMark) num = crit.maxMark;
    } else {
      if (num > config.maxTotal) num = config.maxTotal;
    }
    if (num < 0) num = 0;

    setStudentScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [criteriaId]: num
      }
    }));
  };

  const getStudentTotal = (studentId: string) => {
    const scores = studentScores[studentId] || {};
    return Object.values(scores).reduce((acc, val) => acc + (val || 0), 0);
  };

  const handleComplete = async () => {
      if (!activeGroup) return;
      setLoading(true);
      setError("");

      const studentMarks: Record<string, any> = {};
      let groupTotalSum = 0;
      let count = 0;

      activeGroup.students?.forEach(s => {
        const total = getStudentTotal(s.id);
        studentMarks[s.id] = {
          scores: studentScores[s.id] || {},
          total
        };
        groupTotalSum += total;
        count++;
      });

      const averageGroupTotal = count > 0 ? Math.round(groupTotalSum / count) : 0;
      
      const payload = {
        config,
        studentMarks
      };
      
      let res;
      if (existingMark) {
         res = await supabase.from("marks").update({
            criteria_json: payload,
            total: averageGroupTotal
         }).eq("id", existingMark.id).select().single();
      } else {
         res = await supabase.from("marks").insert({
            group_id: activeGroup.id,
            criteria_json: payload,
            total: averageGroupTotal
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
    <div className="flex flex-col xl:flex-row gap-6">
       
       {/* Left Panel: Queue (Now refined) */}
       <div className="w-full xl:w-1/4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit sticky top-6">
          <div className="flex items-center justify-between mb-6">
             <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
               <Users className="w-5 h-5 text-blue-600" /> Queue
             </h2>
             <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
               {marks.length}/{groups.length} Done
             </span>
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
             {groups.map((group) => {
                 const isCompleted = marks.some(m => m.group_id === group.id);
                 const isActive = activeGroupId === group.id;
                 return (
                 <button 
                   key={group.id}
                   onClick={() => handleGroupSelect(group.id)}
                   className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center group ${isActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-600 bg-transparent'}`}
                 >
                    <div className="flex flex-col gap-1">
                      <span className={`font-semibold text-sm ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        Group {group.group_number}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        {group.students?.length || 0} members
                      </span>
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-500 translate-x-1' : 'text-slate-300 group-hover:text-slate-400'}`} />
                    )}
                 </button>
             )})}
          </div>
       </div>
       
       {/* Right Panel: Content / Marker Context */}
       <div className="w-full xl:w-3/4 flex flex-col gap-4">
          
          {/* Header Controls for Settings */}
          <div className="flex justify-end">
             <button 
               onClick={() => setShowConfig(!showConfig)}
               className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
             >
               <Settings className="w-4 h-4" />
               Marking Criteria Settings
             </button>
          </div>

          {/* Config Modal / Panel inline */}
          {showConfig && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-2 animate-in fade-in slide-in-from-top-4">
               <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Criteria Configuration</h3>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <input 
                      type="checkbox" 
                      id="useCriteriaToggle" 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      checked={config.useCriteria}
                      onChange={(e) => setConfig({...config, useCriteria: e.target.checked})}
                    />
                    <label htmlFor="useCriteriaToggle" className="font-medium text-slate-700 dark:text-slate-300 select-none">
                      Divide full marks into specific criteria
                    </label>
                  </div>

                  {!config.useCriteria ? (
                     <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Set Default Full Marks</span>
                        <input 
                          type="number" 
                          className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 w-24 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                          value={config.maxTotal}
                          onChange={(e) => setConfig({...config, maxTotal: Number(e.target.value) || 0})}
                        />
                     </div>
                  ) : (
                     <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/20">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Define Criteria</span>
                          <button 
                            onClick={() => {
                              setConfig({
                                ...config,
                                criteria: [...config.criteria, { id: Date.now().toString(), name: "New Criteria", maxMark: 10 }]
                              });
                            }}
                            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:border-blue-300 transition-colors"
                          >
                             <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                           {config.criteria.map((c, i) => (
                              <div key={c.id} className="flex items-center gap-3">
                                 <input 
                                   type="text" 
                                   className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                   value={c.name}
                                   placeholder="Criteria Name"
                                   onChange={(e) => {
                                      const newC = [...config.criteria];
                                      newC[i].name = e.target.value;
                                      setConfig({...config, criteria: newC});
                                   }}
                                 />
                                 <span className="text-sm text-slate-400">Max:</span>
                                 <input 
                                   type="number" 
                                   className="w-20 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                   value={c.maxMark}
                                   onChange={(e) => {
                                      const newC = [...config.criteria];
                                      newC[i].maxMark = Number(e.target.value) || 0;
                                      setConfig({...config, criteria: newC});
                                   }}
                                 />
                                 <button 
                                   onClick={() => {
                                      const newC = config.criteria.filter(x => x.id !== c.id);
                                      setConfig({...config, criteria: newC});
                                   }}
                                   className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                           <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                             Calculated Total: {config.criteria.reduce((a, b) => a + b.maxMark, 0)}
                           </span>
                        </div>
                     </div>
                  )}
               </div>

               <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => saveConfig(config)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Save Settings
                  </button>
               </div>
            </div>
          )}

          {activeGroup ? (
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  {/* Subject Context Header */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h2 className="font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center rounded-xl">
                          {activeGroup.group_number}
                        </div>
                        Group {activeGroup.group_number}
                      </h2>
                      
                      {activeGroup.slide_link ? (
                          <a href={activeGroup.slide_link} target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors">
                            <Presentation className="w-4 h-4" />
                            Open Presentation <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                          </a>
                      ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-medium">
                            No slides submitted
                          </div>
                      )}
                    </div>
                    
                    {activeGroup.topic && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">Approved Topic</span>
                        <p className="font-medium text-slate-900 dark:text-slate-100 text-lg">{activeGroup.topic}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-8" />
                  
                  {/* Marking Zone */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Individual Student Marks</h3>
                    {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}
                  </div>
                  
                  <div className="space-y-4 mb-8">
                     {activeGroup.students?.length ? activeGroup.students.map((student) => {
                       const totalScore = getStudentTotal(student.id);
                       const maxPossible = config.useCriteria 
                          ? config.criteria.reduce((a, b) => a + b.maxMark, 0)
                          : config.maxTotal;

                       return (
                         <div key={student.id} className="p-4 sm:p-5 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                             <div>
                               <h4 className="font-bold text-slate-900 dark:text-white text-base">{student.name}</h4>
                               <span className="text-xs font-mono text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 mt-1 inline-block">
                                 {student.student_id}
                               </span>
                             </div>
                             
                             <div className="flex items-center gap-2">
                               <div className="text-right">
                                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total</span>
                                 <span className={`text-xl font-bold ${totalScore > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                   {totalScore} <span className="text-sm font-medium text-slate-400">/ {maxPossible}</span>
                                 </span>
                               </div>
                             </div>
                           </div>

                           {/* Inputs */}
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             {config.useCriteria ? (
                                config.criteria.map(crit => (
                                  <div key={crit.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                                      {crit.name} <span className="text-slate-400 font-normal">(/ {crit.maxMark})</span>
                                    </label>
                                    <input 
                                      type="number" 
                                      min="0" 
                                      max={crit.maxMark} 
                                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                      value={studentScores[student.id]?.[crit.id] ?? ""}
                                      placeholder="0"
                                      onChange={(e) => handleScoreChange(student.id, crit.id, e.target.value)}
                                    />
                                  </div>
                                ))
                             ) : (
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2 col-span-2 sm:col-span-1">
                                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Full Mark <span className="text-slate-400 font-normal">(/ {config.maxTotal})</span>
                                  </label>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    max={config.maxTotal} 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                      value={studentScores[student.id]?.["full"] ?? ""}
                                    placeholder="0"
                                    onChange={(e) => handleScoreChange(student.id, "full", e.target.value)}
                                  />
                                </div>
                             )}
                           </div>
                         </div>
                       );
                     }) : (
                       <div className="text-center py-6 text-slate-500">
                         No students found in this group.
                       </div>
                     )}
                  </div>
                  
                  <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                      <button 
                         onClick={handleComplete} 
                         disabled={loading || !activeGroup.students?.length}
                         className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm shadow-blue-500/30 transition-all active:scale-95"
                      >
                         {loading ? "Saving..." : "Save Marks & Next"}
                         {!loading && <Save className="w-4 h-4 ml-1" />}
                      </button>
                  </div>
              </div>
          ) : (
              <div className="bg-white dark:bg-slate-900 h-96 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <Users className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                 </div>
                 <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Ready to evaluate</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Select a group from the queue to start marking.</p>
              </div>
          )}
       </div>
    </div>
  );
}