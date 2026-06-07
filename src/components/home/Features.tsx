"use client";

import { motion } from "framer-motion";
import { Users, Mic, CheckCircle, Paperclip } from "lucide-react";

const features = [
  {
    icon: <Users className="w-6 h-6 text-indigo-400" />,
    title: "Group Management",
    description:
      "Students join groups with a single tap. No forms, no login required. Group slots fill up automatically.",
  },
  {
    icon: <Mic className="w-6 h-6 text-rose-400" />,
    title: "Live Presentation Mode",
    description:
      "Teachers navigate through groups one by one. Current group is highlighted. Slide links open instantly.",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
    title: "Instant Marking",
    description:
      "Mark each group live during the presentation. Scores are saved to the database in real time.",
  },
  {
    icon: <Paperclip className="w-6 h-6 text-amber-400" />,
    title: "Slide Submission",
    description:
      "Groups submit a Google Slides or Drive link. Submissions lock automatically when the teacher closes the section.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 px-4 bg-[#030303] relative border-t border-white/[0.05]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/[0.02] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-indigo-400/80 uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto leading-relaxed">
            Presento keeps it simple. Four core features that replace your
            entire current workflow.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, index) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className="group p-8 rounded-3xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:scale-110 group-hover:bg-white/[0.06] transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-white/90 mb-3">
                {f.title}
              </h3>
              <p className="text-white/50 leading-relaxed text-sm">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
