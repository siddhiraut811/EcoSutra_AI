import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { useState } from "react";

const cityData = [
  { city: "Mumbai",    heatIndex: 42, greenCover: 18, coolingScore: 54, tempReduced: 2.1, heatIslands: 210 },
  { city: "Delhi",     heatIndex: 47, greenCover: 11, coolingScore: 38, tempReduced: 1.4, heatIslands: 340 },
  { city: "Singapore", heatIndex: 35, greenCover: 47, coolingScore: 82, tempReduced: 5.6, heatIslands: 45  },
  { city: "Tokyo",     heatIndex: 38, greenCover: 36, coolingScore: 74, tempReduced: 4.2, heatIslands: 88  },
  { city: "Phoenix",   heatIndex: 48, greenCover: 9,  coolingScore: 31, tempReduced: 1.1, heatIslands: 390 },
  { city: "Amsterdam", heatIndex: 30, greenCover: 52, coolingScore: 88, tempReduced: 6.3, heatIslands: 22  },
];

const radarData = cityData.map((c) => ({
  city: c.city,
  "Green Cover %": c.greenCover,
  "Cooling Score": c.coolingScore,
  "Temp Reduced (×10)": Math.round(c.tempReduced * 10),
}));

const METRICS = [
  { key: "heatIndex",    label: "Heat Index (°C)",     color: "#f97316" },
  { key: "greenCover",   label: "Green Cover (%)",     color: "#4ade80" },
  { key: "coolingScore", label: "Cooling Score",       color: "#38bdf8" },
  { key: "tempReduced",  label: "Temp Reduced (°C)",   color: "#a78bfa" },
  { key: "heatIslands",  label: "Heat Islands Count",  color: "#fb7185" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-orange-500/30 rounded-xl px-4 py-3 text-sm">
        <p className="text-orange-400 font-bold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.fill }} className="leading-6">
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CityComparison() {
  const [activeMetric, setActiveMetric] = useState(METRICS[0]);

  return (
    <section id="comparison" className="px-10 py-10">
      <div className="text-center mb-8">
        <span className="bg-orange-900/50 text-orange-300 px-4 py-1 rounded-full text-sm font-medium">
          Global Benchmarking
        </span>
        <h2 className="text-3xl font-bold mt-4">
          City Heat <span className="text-orange-400">Comparison</span>
        </h2>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">
          Compare how major cities perform on heat index, green cover, and mitigation effectiveness.
        </p>
      </div>

      {/* Metric Selector */}
      <div
        role="group"
        aria-label="Select chart metric"
        className="flex flex-wrap gap-3 justify-center mb-8"
      >
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m)}
            aria-pressed={activeMetric.key === m.key}
            aria-label={`Show ${m.label}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              activeMetric.key === m.key
                ? "border-orange-500 bg-orange-500/20 text-orange-300"
                : "border-slate-700 text-gray-400 hover:border-orange-500/40"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-slate-900 rounded-2xl border border-orange-500/20 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            {activeMetric.label} — by City
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cityData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="city" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={activeMetric.key}
                name={activeMetric.label}
                fill={activeMetric.color}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-slate-900 rounded-2xl border border-orange-500/20 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Multi-Metric Radar — Top 3 Cities
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={[
              { metric: "Green Cover %",       Singapore: 47, Amsterdam: 52, Tokyo: 36 },
              { metric: "Cooling Score",        Singapore: 82, Amsterdam: 88, Tokyo: 74 },
              { metric: "Temp Reduced (×10)",   Singapore: 56, Amsterdam: 63, Tokyo: 42 },
              { metric: "Low Heat Islands",     Singapore: 85, Amsterdam: 95, Tokyo: 72 },
              { metric: "Low Heat Index",       Singapore: 65, Amsterdam: 90, Tokyo: 80 },
            ]}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Radar name="Singapore" dataKey="Singapore" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
              <Radar name="Amsterdam" dataKey="Amsterdam" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} />
              <Radar name="Tokyo"     dataKey="Tokyo"     stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
              <Legend
                formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #f97316", borderRadius: 8 }}
                labelStyle={{ color: "#f97316" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* City Score Table */}
      <div className="mt-6 bg-slate-900 rounded-2xl border border-orange-500/20 overflow-hidden">
        <table className="w-full text-sm" aria-label="City heat mitigation rankings">
          <caption className="sr-only">Cities ranked by cooling score, highest first</caption>
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th scope="col" className="text-left px-6 py-3 text-gray-400 font-medium">City</th>
              <th scope="col" className="text-right px-4 py-3 text-gray-400 font-medium">Heat Index</th>
              <th scope="col" className="text-right px-4 py-3 text-gray-400 font-medium">Green Cover</th>
              <th scope="col" className="text-right px-4 py-3 text-gray-400 font-medium">Temp Reduced</th>
              <th scope="col" className="text-right px-6 py-3 text-gray-400 font-medium">Cooling Score</th>
            </tr>
          </thead>
          <tbody>
            {[...cityData].sort((a, b) => b.coolingScore - a.coolingScore).map((c, i) => (
              <tr key={c.city} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-3 font-medium flex items-center gap-3">
                  <span className="text-orange-500 font-bold w-5">{i + 1}</span>
                  {c.city}
                </td>
                <td className="text-right px-4 py-3 text-red-400">{c.heatIndex}°C</td>
                <td className="text-right px-4 py-3 text-green-400">{c.greenCover}%</td>
                <td className="text-right px-4 py-3 text-purple-400">−{c.tempReduced}°C</td>
                <td className="text-right px-6 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: `${c.coolingScore}px` }}
                    />
                    <span className="text-orange-400 font-semibold">{c.coolingScore}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
