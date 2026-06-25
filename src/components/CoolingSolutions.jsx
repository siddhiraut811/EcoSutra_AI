const solutions = [
  {
    icon: "🌳",
    title: "Urban Tree Canopy",
    impact: "−3°C to −8°C",
    desc: "Strategically planted trees shade streets and buildings, reduce pavement heat absorption, and release moisture through transpiration.",
    tips: ["Plant native shade trees along south-facing streets", "Target tree coverage of ≥30% per city block", "Prioritize low-income neighborhoods with least canopy"],
  },
  {
    icon: "🏠",
    title: "Cool & Green Roofs",
    impact: "−2°C to −5°C",
    desc: "Reflective white/cool roofs bounce sunlight away. Vegetated green roofs add insulation and evaporative cooling.",
    tips: ["Use solar-reflective coatings (albedo > 0.65)", "Install sedum or grass green roofs on flat surfaces", "Retrofit existing dark rooftops first — biggest ROI"],
  },
  {
    icon: "🛣️",
    title: "Cool Pavements",
    impact: "−1°C to −3°C",
    desc: "Permeable or light-colored pavements absorb less heat than asphalt, allowing rainwater infiltration to cool the surface.",
    tips: ["Replace dark asphalt with light-grey concrete", "Use permeable pavers in parking lots and sidewalks", "Apply reflective sealants on existing roads"],
  },
  {
    icon: "💧",
    title: "Water Features & Misting",
    impact: "−2°C to −6°C",
    desc: "Fountains, canals, and public misting stations cool the surrounding air through evaporation, creating micro-cool zones.",
    tips: ["Install misting corridors in pedestrian zones", "Restore urban streams and water bodies", "Deploy smart sensors to activate misters during heat peaks"],
  },
  {
    icon: "🌬️",
    title: "Urban Wind Corridors",
    impact: "−1°C to −4°C",
    desc: "Designing buildings to channel natural breezes through cities reduces stagnant hot air and lowers ambient temperatures.",
    tips: ["Preserve ventilation corridors in city planning", "Orient new buildings to avoid blocking prevailing winds", "Use green walls to channel and cool airflow"],
  },
  {
    icon: "⚡",
    title: "Energy & Emission Cuts",
    impact: "Long-term −1°C+",
    desc: "Reducing waste heat from vehicles, AC units, and industry directly lowers the urban heat load at its source.",
    tips: ["Transition to EVs to cut exhaust waste heat", "Upgrade to efficient HVAC with heat recovery", "Shift industrial processes to cooler night hours"],
  },
];

export default function CoolingSolutions() {
  return (
    <section id="solutions" className="px-10 py-10">
      <div className="text-center mb-10">
        <span className="bg-orange-900/50 text-orange-300 px-4 py-1 rounded-full text-sm font-medium">
          Evidence-Based Strategies
        </span>
        <h2 className="text-3xl font-bold mt-4">
          Cooling Solutions <span className="text-orange-400">Guide</span>
        </h2>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">
          Proven interventions ranked by temperature reduction impact. Each strategy is field-validated across global cities.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {solutions.map((s) => (
          <div
            key={s.title}
            className="bg-slate-900 rounded-2xl border border-orange-500/20 hover:border-orange-500/50 transition-colors overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <span className="text-4xl" role="img" aria-label={s.title}>{s.icon}</span>
                <span className="bg-orange-900/50 text-orange-300 text-xs font-bold px-3 py-1 rounded-full">
                  {s.impact}
                </span>
              </div>
              <h3 className="text-xl font-semibold mt-4">{s.title}</h3>
              <p className="text-gray-400 mt-2 text-sm leading-relaxed">{s.desc}</p>
            </div>
            <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700/50">
              <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2">Quick Tips</p>
              <ul className="space-y-1">
                {s.tips.map((tip) => (
                  <li key={tip} className="text-gray-400 text-xs flex gap-2">
                    <span className="text-orange-500 mt-0.5">›</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
