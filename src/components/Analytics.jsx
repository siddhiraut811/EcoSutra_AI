const stats = [
  {
    label: "Urban Heat Islands Detected",
    value: "1,284",
    sub: "across 340 cities",
  },
  {
    label: "Avg. Surface Temp Reduced",
    value: "−4.2°C",
    sub: "via AI-guided interventions",
  },
  {
    label: "CO₂ Linked to Heat Events",
    value: "2.3 Mt",
    sub: "correlated & tracked this year",
  },
  {
    label: "Green Roofs Recommended",
    value: "18,900",
    sub: "buildings flagged for cooling",
  },
  {
    label: "Trees Needed to Cool Cities",
    value: "4.1M",
    sub: "AI-placed canopy projections",
  },
  {
    label: "Lives Protected from Heat",
    value: "620K",
    sub: "early warnings issued",
  },
];

export default function Analytics() {
  return (
    <section id="analytics" className="px-10 py-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Heat Mitigation <span className="text-orange-400">Impact Dashboard</span>
      </h2>

      <div className="grid md:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">{s.label}</h3>
            <p className="text-5xl font-bold mt-3 text-orange-400">{s.value}</p>
            <p className="text-gray-500 text-sm mt-2">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
