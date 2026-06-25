import { useState, useMemo, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// Emission factors (kg CO₂ per unit)
const FACTORS = {
  car:        0.21,   // per km
  flight:     0.255,  // per km
  publicTrans: 0.041, // per km
  electricity: 0.475, // per kWh
  gas:        2.04,   // per m³
  beef:       27,     // per kg
  chicken:    6.9,    // per kg
  vegetables: 2.0,    // per kg
  shopping:   0.5,    // per USD spend (approx)
};

const GLOBAL_AVG_KG = 4000 * 12; // ~48,000 kg/year (4 tons/month)
const INDIA_AVG_KG  = 1900 * 12;

const CATEGORIES = [
  {
    id: "transport",
    label: "🚗 Transport",
    color: "#f97316",
    fields: [
      { id: "car",         label: "Car travel",          unit: "km/month",    max: 3000, factor: FACTORS.car,        icon: "🚗" },
      { id: "flight",      label: "Flights",              unit: "km/month",    max: 5000, factor: FACTORS.flight,     icon: "✈️" },
      { id: "publicTrans", label: "Public transport",     unit: "km/month",    max: 1000, factor: FACTORS.publicTrans, icon: "🚌" },
    ],
  },
  {
    id: "home",
    label: "🏠 Home Energy",
    color: "#38bdf8",
    fields: [
      { id: "electricity", label: "Electricity",          unit: "kWh/month",   max: 1000, factor: FACTORS.electricity, icon: "⚡" },
      { id: "gas",         label: "Gas / LPG",            unit: "m³/month",    max: 100,  factor: FACTORS.gas,         icon: "🔥" },
    ],
  },
  {
    id: "diet",
    label: "🥗 Diet",
    color: "#4ade80",
    fields: [
      { id: "beef",        label: "Beef / red meat",      unit: "kg/month",    max: 30,   factor: FACTORS.beef,        icon: "🥩" },
      { id: "chicken",     label: "Poultry / fish",       unit: "kg/month",    max: 30,   factor: FACTORS.chicken,     icon: "🍗" },
      { id: "vegetables",  label: "Vegetables / grains",  unit: "kg/month",    max: 50,   factor: FACTORS.vegetables,  icon: "🥦" },
    ],
  },
  {
    id: "shopping",
    label: "🛍️ Shopping",
    color: "#a78bfa",
    fields: [
      { id: "shopping",    label: "Monthly purchases",    unit: "USD/month",   max: 2000, factor: FACTORS.shopping,    icon: "🛒" },
    ],
  },
];

const ALL_FIELDS = CATEGORIES.flatMap((c) => c.fields);

const DEFAULTS = {
  car: 500, flight: 200, publicTrans: 150,
  electricity: 300, gas: 20,
  beef: 4, chicken: 6, vegetables: 15,
  shopping: 300,
};

function getRating(annual) {
  if (annual < 20000) return { label: "Low",     color: "text-green-400",  bar: "bg-green-500",  pct: 25, emoji: "🌿" };
  if (annual < 40000) return { label: "Average", color: "text-yellow-400", bar: "bg-yellow-500", pct: 55, emoji: "⚠️" };
  if (annual < 60000) return { label: "High",    color: "text-orange-400", bar: "bg-orange-500", pct: 75, emoji: "🌡️" };
  return               { label: "Very High", color: "text-red-400",    bar: "bg-red-500",    pct: 95, emoji: "🔴" };
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-orange-500/30 rounded-xl px-4 py-3 text-sm">
        <p className="text-orange-300 font-bold">{payload[0].name}</p>
        <p className="text-white">{payload[0].value.toLocaleString()} kg CO₂/yr</p>
      </div>
    );
  }
  return null;
};

export default function CarbonCalculator({ onFootprintChange }) {
  const [values, setValues] = useState(DEFAULTS);
  const [activeTab, setActiveTab] = useState("transport");

  const set = (id, val) =>
    setValues((prev) => ({ ...prev, [id]: Math.max(0, Number(val)) }));

  // Monthly kg CO₂ per field → annual
  const perCategory = useMemo(() =>
    CATEGORIES.map((cat) => ({
      name: cat.label.replace(/^.\s/, ""),
      color: cat.color,
      value: Math.round(
        cat.fields.reduce((sum, f) => sum + (values[f.id] || 0) * f.factor, 0) * 12
      ),
    })), [values]);

  const totalAnnual = perCategory.reduce((s, c) => s + c.value, 0);
  const totalMonthly = Math.round(totalAnnual / 12);
  const rating = getRating(totalAnnual);

  // Push live footprint (in tonnes) up to App so Leaderboard can auto-fill it
  const totalTonnes = Math.round(totalAnnual / 1000 * 10) / 10;
  useEffect(() => {
    onFootprintChange?.(totalTonnes);
  }, [totalTonnes, onFootprintChange]);

  // Heat impact: 1 tonne CO₂ ≈ 0.0018°C urban temp rise (simplified proxy)
  const heatContrib = ((totalAnnual / 1000) * 0.0018).toFixed(4);

  const pieData = perCategory.filter((c) => c.value > 0);

  const comparisonData = [
    { name: "You",        value: Math.round(totalAnnual / 1000 * 10) / 10 },
    { name: "India avg",  value: Math.round(INDIA_AVG_KG / 1000 * 10) / 10 },
    { name: "World avg",  value: Math.round(GLOBAL_AVG_KG / 1000 * 10) / 10 },
    { name: "Target",     value: 2.0 },
  ];

  return (
    <section id="carbon" className="px-10 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="bg-green-900/50 text-green-300 px-4 py-1 rounded-full text-sm font-medium">
          Personal Impact Tool
        </span>
        <h2 className="text-3xl font-bold mt-4">
          Carbon Footprint <span className="text-orange-400">Calculator</span>
        </h2>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">
          Calculate your monthly CO₂ emissions across transport, energy, diet and shopping —
          and see how your footprint drives urban heat.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Left: Input Panel ── */}
        <div className="bg-slate-900 rounded-2xl border border-orange-500/20 overflow-hidden">
          {/* Category tabs */}
          <div className="flex border-b border-slate-700">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                aria-pressed={activeTab === cat.id}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === cat.id
                    ? "bg-orange-500/10 text-orange-300 border-b-2 border-orange-500"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {cat.label.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Fields for active tab */}
          <div className="p-6 space-y-6">
            {CATEGORIES.find((c) => c.id === activeTab)?.fields.map((field) => {
              const monthly = Math.round((values[field.id] || 0) * field.factor);
              return (
                <div key={field.id}>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor={field.id} className="text-sm font-medium text-gray-200 flex items-center gap-2">
                      <span>{field.icon}</span> {field.label}
                    </label>
                    <span className="text-orange-400 text-xs font-semibold bg-orange-900/30 px-2 py-0.5 rounded-full">
                      ~{monthly} kg CO₂/mo
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id={field.id}
                      type="range"
                      min={0}
                      max={field.max}
                      step={field.max > 100 ? 10 : 1}
                      value={values[field.id] || 0}
                      onChange={(e) => set(field.id, e.target.value)}
                      className="flex-1 accent-orange-500 h-2 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      aria-label={`${field.label} value`}
                      min={0}
                      max={field.max}
                      value={values[field.id] || 0}
                      onChange={(e) => set(field.id, e.target.value)}
                      className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-center text-white outline-none focus:border-orange-500"
                    />
                    <span className="text-gray-500 text-xs w-20 text-right">{field.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset */}
          <div className="px-6 pb-6">
            <button
              onClick={() => setValues(DEFAULTS)}
              className="w-full border border-slate-700 hover:border-orange-500/40 text-gray-400 hover:text-gray-200 transition-colors py-2 rounded-xl text-sm"
            >
              Reset to defaults
            </button>
          </div>
        </div>

        {/* ── Right: Results Panel ── */}
        <div className="space-y-5">
          {/* Total score card */}
          <div className="bg-slate-900 rounded-2xl border border-orange-500/20 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wider">Your Carbon Footprint</p>
                <p className={`text-5xl font-bold mt-2 ${rating.color}`}>
                  {(totalAnnual / 1000).toFixed(1)}
                  <span className="text-xl ml-1">tonnes CO₂/yr</span>
                </p>
                <p className="text-gray-500 text-sm mt-1">{totalMonthly.toLocaleString()} kg per month</p>
              </div>
              <span className="text-5xl">{rating.emoji}</span>
            </div>

            {/* Rating bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Low</span><span>Average</span><span>High</span><span>Very High</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${rating.bar}`}
                  style={{ width: `${rating.pct}%` }}
                />
              </div>
              <p className={`text-sm font-semibold mt-2 ${rating.color}`}>{rating.label} emissions</p>
            </div>

            {/* Heat impact link */}
            <div className="mt-4 bg-orange-900/20 border border-orange-800/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">🌡️</span>
              <div>
                <p className="text-orange-300 text-sm font-semibold">Urban Heat Contribution</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Your footprint adds an estimated{" "}
                  <span className="text-orange-400 font-bold">+{heatContrib}°C</span>{" "}
                  to local urban temperature annually.
                </p>
              </div>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-slate-900 rounded-2xl border border-orange-500/20 p-6">
            <h3 className="text-base font-semibold text-gray-200 mb-4">Breakdown by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison bar chart */}
          <div className="bg-slate-900 rounded-2xl border border-orange-500/20 p-6">
            <h3 className="text-base font-semibold text-gray-200 mb-4">
              vs. Global Benchmarks (tonnes/yr)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={comparisonData} layout="vertical" margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} width={65} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #f97316", borderRadius: 8 }}
                  labelStyle={{ color: "#f97316" }}
                  formatter={(v) => [`${v} t CO₂`, ""]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {comparisonData.map((d) => (
                    <Cell
                      key={d.name}
                      fill={
                        d.name === "You"       ? "#f97316" :
                        d.name === "Target"    ? "#4ade80" :
                                                 "#475569"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick reduction tips */}
      <div className="mt-8 grid md:grid-cols-4 gap-4">
        {[
          { icon: "🚲", tip: "Replace 3 car trips/week with cycling",   saving: "−720 kg/yr" },
          { icon: "🌱", tip: "Go meat-free 3 days a week",              saving: "−500 kg/yr" },
          { icon: "💡", tip: "Switch to LED & solar energy",            saving: "−800 kg/yr" },
          { icon: "✈️", tip: "Take one fewer long-haul flight",         saving: "−2,000 kg/yr" },
        ].map((r) => (
          <div key={r.tip} className="bg-slate-900 rounded-xl border border-green-800/30 p-4">
            <span className="text-3xl">{r.icon}</span>
            <p className="text-gray-300 text-sm mt-2">{r.tip}</p>
            <p className="text-green-400 font-bold text-sm mt-1">{r.saving}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
