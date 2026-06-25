const features = [
  {
    title: "Heat Island Mapping",
    desc: "Satellite thermal imagery identifies urban hot spots at 10m resolution in real time.",
    icon: "🗺️",
  },
  {
    title: "Cooling Strategy AI",
    desc: "ML models recommend green roofs, cool pavements, and tree placement to cut surface temps.",
    icon: "🌿",
  },
  {
    title: "Carbon & Heat Link",
    desc: "Quantifies how carbon emissions amplify local heat — closing the loop between footprint and temperature.",
    icon: "🔗",
  },
  {
    title: "Community Alerts",
    desc: "Early-warning notifications for heat events protect vulnerable populations before they peak.",
    icon: "🚨",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="px-10 py-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        How <span className="text-orange-400">EcoSutra AI</span> Fights Urban Heat
      </h2>
      <div className="grid md:grid-cols-4 gap-5">
        {features.map((item) => (
          <div
            key={item.title}
            className="bg-slate-900 p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/50 transition-colors"
          >
            <span className="text-4xl" role="img" aria-label={item.title}>{item.icon}</span>
            <h3 className="text-xl font-semibold mt-4">{item.title}</h3>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
