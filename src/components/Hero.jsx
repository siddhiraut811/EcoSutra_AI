export default function Hero() {
  return (
    <section id="hero" className="grid md:grid-cols-2 gap-10 p-10 items-center min-h-[85vh]">

      <div>
        <span className="bg-orange-900/60 text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
          AI-Powered Heat Mitigation Intelligence
        </span>

        <h1 className="text-6xl font-bold mt-6 leading-tight">
          Fighting Urban Heat
          <span className="text-orange-400"> One Degree at a Time</span>
        </h1>

        <p className="mt-5 text-gray-300 text-lg leading-relaxed">
          EcoSutra AI maps urban heat islands, tracks surface temperatures,
          and recommends evidence-based cooling strategies — turning heat data
          into actionable mitigation plans for cities and communities.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="#map"
            className="bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-3 rounded-xl font-semibold"
          >
            Explore Heat Map
          </a>

          <a
            href="#features"
            className="border border-orange-500/50 hover:border-orange-400 transition-colors px-6 py-3 rounded-xl"
          >
            View Solutions
          </a>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-900 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-400">−4.2°C</p>
            <p className="text-gray-400 text-sm mt-1">Avg. temp reduction</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-400">340+</p>
            <p className="text-gray-400 text-sm mt-1">Cities monitored</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-400">98%</p>
            <p className="text-gray-400 text-sm mt-1">Prediction accuracy</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900"
          alt="Aerial view of a dense urban city — heat island environment"
          className="rounded-3xl w-full object-cover h-[520px]"
        />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-orange-900/40 to-transparent" />
        <div className="absolute bottom-6 left-6 bg-slate-950/80 backdrop-blur rounded-xl px-4 py-3">
          <p className="text-orange-400 font-semibold text-sm">🌡️ Live Surface Temp</p>
          <p className="text-white text-2xl font-bold">38.4°C <span className="text-red-400 text-sm">↑ +6.1° above rural</span></p>
        </div>
      </div>
    </section>
  );
}
