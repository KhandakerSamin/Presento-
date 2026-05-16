const features = [
  {
    icon: "👥",
    title: "Group Management",
    description:
      "Students join groups with a single tap. No forms, no login required. Group slots fill up automatically.",
  },
  {
    icon: "🎤",
    title: "Live Presentation Mode",
    description:
      "Teachers navigate through groups one by one. Current group is highlighted. Slide links open instantly.",
  },
  {
    icon: "✅",
    title: "Instant Marking",
    description:
      "Mark each group live during the presentation. Scores are saved to the database in real time.",
  },
  {
    icon: "📎",
    title: "Slide Submission",
    description:
      "Groups submit a Google Slides or Drive link. Submissions lock automatically when the teacher closes the section.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 px-4 bg-white dark:bg-slate-900"
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Presento keeps it simple. Four core features that replace your
            entire current workflow.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-200"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}