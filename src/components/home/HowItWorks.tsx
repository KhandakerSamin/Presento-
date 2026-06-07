"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    who: "Teacher",
    title: "Create a Section",
    description:
      "Teacher creates a section for their course. System generates a unique code like SWE-SE221-42-A automatically.",
  },
  {
    step: "02",
    who: "CR",
    title: "Share the Code",
    description:
      "CR shares the section code or QR code with all students in the class via WhatsApp or class group.",
  },
  {
    step: "03",
    who: "Students",
    title: "Join Groups",
    description:
      "Students visit the section page, enter their name and student ID, and join an available group slot.",
  },
  {
    step: "04",
    who: "Students",
    title: "Submit Slides",
    description:
      "Each group submits their Google Slides link before the deadline. Teacher can lock submissions anytime.",
  },
  {
    step: "05",
    who: "Teacher",
    title: "Run Presentation",
    description:
      "Teacher opens Presentation Mode. Groups appear one by one. Teacher marks each group live.",
  },
  {
    step: "06",
    who: "Teacher",
    title: "Export Marks",
    description:
      "After all presentations, teacher exports a CSV or PDF marksheet with all group scores.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-4 bg-[#030303] relative border-t border-white/[0.05]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-rose-500/[0.02] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-rose-400/80 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
            From setup to marksheet in 6 steps
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, index) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.4, 0.25, 1] as const,
              }}
              className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 pointer-events-none">
                <span className="text-6xl font-bold text-white/[0.03] group-hover:text-white/[0.05] transition-colors">
                  {s.step}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    s.who === "Teacher"
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      : s.who === "CR"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {s.who}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white/90 mb-3 relative z-10">
                {s.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed relative z-10">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
