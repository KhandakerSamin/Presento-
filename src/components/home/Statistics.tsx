const stats = [
  { value: "20+", label: "Sections Created" },
  { value: "500+", label: "Students Joined" },
  { value: "80+", label: "Presentations Done" },
  { value: "1,200+", label: "Marks Given" },
];

export default function Statistics() {
  return (
    <section className="py-20 px-4 bg-indigo-600 dark:bg-indigo-700">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-white mb-2">
                {s.value}
              </div>
              <div className="text-indigo-100 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
