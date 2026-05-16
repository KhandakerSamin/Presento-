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
      className="py-24 px-4 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            From setup to marksheet in 6 steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-slate-100 dark:text-slate-800">
                  {s.step}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    s.who === "Teacher"
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                      : s.who === "CR"
                      ? "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                      : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {s.who}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}