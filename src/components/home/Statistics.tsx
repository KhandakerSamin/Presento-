"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "20+", label: "Sections Created" },
  { value: "500+", label: "Students Joined" },
  { value: "80+", label: "Presentations Done" },
  { value: "1,200+", label: "Marks Given" },
];

export default function Statistics() {
  return (
    <section className="py-24 px-4 bg-[#030303] relative border-t border-white/[0.05]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/[0.02] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, index) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
            >
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-2 md:mb-3">
                {s.value}
              </div>
              <div className="text-sm md:text-base text-white/50 tracking-wide">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
