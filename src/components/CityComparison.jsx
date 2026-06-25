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
import { useState, useMemo } from "react";

const ALL_CITIES = [
  { city: "Mumbai",      heatIndex: 42, greenCover: 18, coolingScore: 54, tempReduced: 2.1, heatIslands: 210 },
  { city: "Delhi",       heatIndex: 47, greenCover: 11, coolingScore: 38, tempReduced: 1.4, heatIslands: 340 },
  { city: "Singapore",   heatIndex: 35, greenCover: 47, coolingScore: 82, tempReduced: 5.6, heatIslands: 45  },
  { city: "Tokyo",       heatIndex: 38, greenCover: 36, coolingScore: 74, tempReduced: 4.2, heatIslands: 88  },
  { city: "Phoenix",     heatIndex: 48, greenCover: 9,  coolingScore: 31, tempReduced: 1.1, heatIslands: 390 },
  { city: "Amsterdam",   heatIndex: 30, greenCover: 52, coolingScore: 88, tempReduced: 6.3, heatIslands: 22  },
  { city: "London",      heatIndex: 29, greenCover: 47, coolingScore: 85, tempReduced: 5.9, heatIslands: 30  },
  { city: "New York",    heatIndex: 36, greenCover: 24, coolingScore: 61, tempReduced: 3.2, heatIslands: 175 },
  { city: "Dubai",       heatIndex: 49, greenCover: 6,  coolingScore: 28, tempReduced: 0.9, heatIslands: 410 },
  { city: "Beijing",     heatIndex: 40, greenCover: 29, coolingScore: 58, tempReduced: 2.8, heatIslands: 195 },
  { city: "Los Angeles", heatIndex: 39, greenCover: 21, coolingScore: 55, tempReduced: 2.4, heatIslands: 220 },
  { city: "Seoul",       heatIndex: 37, greenCover: 33, coolingScore: 70, tempReduced: 3.8, heatIslands: 105 },
];

const METRICS = [
  { key: "heatIndex",    label: "Heat Index (°C)",    color: "#f97316" },
  { key: "greenCover",   label: "Green Cover (%)",    color: "#4ade80" },
  { key: "coolingScore", label: "Cooling Score",      color: "#38bdf8" },
  { key: "tempReduced",  label: "Temp Reduced (°C)",  color: "#a78bfa" },
  { key: "heatIslands",  label: "Heat Islands Count", color: "#fb7185" },
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

export default function CityComparison({ searchQuery }) {
  const [activeMetric, setActiveMetric] = useState(METRICS[0]);

  // Filter city data by search query (case-insensitive partial match)
  const filteredCities = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return ALL_CITIES;
    const q = searchQuery.trim().toLowerCase();
    const matched = ALL_CITIES.filter((c) => c.city.toLowerCase().includes(q));
    // If nothing matches by name, show all with a no-match indicator
    return matched.length > 0 ? matched : ALL_CITIES;
  }, [searchQuery]);

  const noMatch =
    searchQuery?.trim() &&
    !ALL_CITIES.some((c) =>
      c.city.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

  // Top 3 by cooling score from current filtered set (min 3, fallback to all)
  const radarCities = useMemo(() => {
    const base = filteredCities.length >= 3 ? filteredCities : ALL_CITIES;
    return [...base].sort((a, b) => b.coolingScore - a.coolingScore).slice(0, 3);
  }, [filteredCities]);

  const radarData = [
    { metric: "Green Cover %",     ...Object.fromEntries(radarCities.map((c) => [c.city, c.greenCover]))     },
    { metric: "Cooling Score",     ...Object.fromEntries(radarCities.map((c) => [c.city, c.coolingScore]))    },
    { metric: "Temp Reduced ×10",  ...Object.fromEntries(radarCities.map((c) => [c.city, Math.round(c.tempReduced * 10)])) },
    { metric: "Low Heat Islands",  ...Object.fromEntries(radarCities.map((c) => [c.city, Math.max(0, 100 - Math.round(c.heatIslands / 5))])) },
    { metric: "Low Heat Index",    ...Object.fromEntries(radarCities.map((c) => [c.city, Math.max(0, 100 - c.heatIndex)])) },
  ];

  const RADAR_COLORS = ["#f97316", "#4ade80", "#38bdf8"];

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
          Compare how cities perform on heat index, green cover, and mitigation effectiveness.
        </p>

        {/* Search result status */}
        {searchQuery?.trim() && (
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium ${
            noMatch
              ? "bg-red-900/40 text-red-300 border border-red-700/40"
              : "bg-orange-900/40 text-orange-300 border border-orange-700/40"
          }`}>
            {noMatch ? (
              <>⚠️ "{searchQuery}" not in dataset — showing all cities</>
            ) : (
              <>📍 Showing results for "{searchQuery}" ({filteredCities.length} {filteredCities.length === 1 ? "city" : "cities"})</>
            )}
          </div>
        )}
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
            <BarChart data={filteredCities} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="city" tick={{ fill: "#94a3b8", fontSize: 11 }} />
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
            Multi-Metric Radar — Top {radarCities.length} by Cooling Score
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              {radarCities.map((c, i) => (
                <Radar
                  key={c.city}
                  name={c.city}
                  dataKey={c.city}
                  stroke={RADAR_COLORS[i]}
                  fill={RADAR_COLORS[i]}
                  fillOpacity={0.15}
                />
              ))}
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
                )}
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

      {/* Ranked Table */}
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
            {[...filteredCities]
              .sort((a, b) => b.coolingScore - a.coolingScore)
              .map((c, i) => {
                const isHighlighted =
                  searchQuery?.trim() &&
                  c.city.toLowerCase().includes(searchQuery.trim().toLowerCase());
                return (
                  <tr
                    key={c.city}
                    className={`border-b border-slate-800 transition-colors ${
                      isHighlighted
                        ? "bg-orange-500/10 border-l-2 border-l-orange-500"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium flex items-center gap-3">
                      <span className="text-orange-500 font-bold w-5">{i + 1}</span>
                      {c.city}
                      {isHighlighted && (
                        <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded-full">
                          match
                        </span>
                      )}
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
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
