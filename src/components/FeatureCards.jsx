const features = [
  "Satellite Monitoring",
  "Climate Intelligence",
  "AI Insights",
  "Real-time Analytics"
];

export default function FeatureCards() {
  return (
    <section className="grid md:grid-cols-4 gap-5 px-10">

      {features.map((item) => (
        <div
          key={item}
          className="bg-slate-900 p-6 rounded-2xl border border-green-500/20"
        >
          <h3 className="text-xl font-semibold">
            {item}
          </h3>

          <p className="text-gray-400 mt-2">
            Smart environmental monitoring.
          </p>
        </div>
      ))}
    </section>
  );
}
