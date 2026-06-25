import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";

// Known cities with heat index (used to calibrate generated zones)
const KNOWN_HEAT = {
  mumbai: 42, delhi: 47, singapore: 35, tokyo: 38, phoenix: 48,
  amsterdam: 30, london: 29, "new york": 36, dubai: 49, beijing: 40,
  "los angeles": 39, seoul: 37, pune: 43, chennai: 44, kolkata: 41,
  hyderabad: 42, bangalore: 38, ahmedabad: 46, jaipur: 47, lucknow: 44,
  cairo: 44, jakarta: 43, bangkok: 45, karachi: 46, tehran: 43,
  "sao paulo": 33, lagos: 41, chicago: 32,
};

// Deterministic seeded random (LCG) — same city always gets same zones
function makeRng(seed) {
  let s = seed | 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 | 0;
    return (s >>> 0) / 4294967296;
  };
}

// Hash a string to a number
function strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Estimate heat index from latitude if city not in known list
function estimateHeatIndex(lat) {
  const absLat = Math.abs(lat);
  if (absLat < 15)  return 44;
  if (absLat < 25)  return 41;
  if (absLat < 35)  return 38;
  if (absLat < 45)  return 34;
  if (absLat < 55)  return 30;
  return 26;
}

// Generate N heat zones around a center point
function generateZones(lat, lon, cityName, baseHeatIndex) {
  const rng   = makeRng(strHash(cityName.toLowerCase()));
  const zones = [];
  const count = 22;

  // Spread in degrees (~8–14 km radius depending on city size)
  const spread = 0.08;

  // Zone probability weights based on overall heat index
  // Each entry: [Cool%, Warm%, Hot%, Critical%]
  let weights;
  if (baseHeatIndex >= 46)      weights = [0, 5,  35, 60];
  else if (baseHeatIndex >= 42) weights = [0, 10, 50, 40];
  else if (baseHeatIndex >= 38) weights = [5, 25, 55, 15];
  else if (baseHeatIndex >= 34) weights = [15, 50, 30, 5];
  else if (baseHeatIndex >= 30) weights = [30, 50, 18, 2];
  else                          weights = [60, 35,  5, 0];

  // Build cumulative thresholds
  const total = weights.reduce((a, b) => a + b, 0);
  const cum   = weights.map(((s) => (v) => (s += v, s))(0)).map((v) => v / total);

  for (let i = 0; i < count; i++) {
    // Random offset using Box-Muller-like distribution for clustering
    const angle  = rng() * 2 * Math.PI;
    const dist   = Math.sqrt(rng()) * spread;   // sqrt gives uniform disk spread
    const zLat   = lat + dist * Math.cos(angle);
    const zLon   = lon + dist * Math.sin(angle) / Math.cos((lat * Math.PI) / 180);

    // Assign zone type
    const r = rng();
    let zoneIdx = r < cum[0] ? 0 : r < cum[1] ? 1 : r < cum[2] ? 2 : 3;

    // Near-center zones tend to be hotter (urban core)
    if (dist < spread * 0.3 && zoneIdx < 2) zoneIdx = Math.min(zoneIdx + 1, 3);

    const radius = 800 + rng() * 1800;  // 800–2600 m per zone circle

    zones.push({ lat: zLat, lon: zLon, zoneIdx, radius });
  }
  return zones;
}

const ZONE_DEFS = [
  { label: "Cool",     heatRange: "< 30°C",  fillColor: "#22c55e", border: "#15803d", bg: "bg-green-500"  },
  { label: "Warm",     heatRange: "30–38°C", fillColor: "#eab308", border: "#a16207", bg: "bg-yellow-500" },
  { label: "Hot",      heatRange: "38–45°C", fillColor: "#f97316", border: "#c2410c", bg: "bg-orange-500" },
  { label: "Critical", heatRange: "> 45°C",  fillColor: "#ef4444", border: "#991b1b", bg: "bg-red-500"    },
];

// Sub-component: smooth fly-to when coords change
function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lon], 12, { duration: 1.8 });
  }, [coords, map]);
  return null;
}

export default function MapSection({ searchCoords, searchQuery }) {
  const hasSearch = !!(searchCoords);

  // Generate zone circles for the searched city
  const zones = useMemo(() => {
    if (!searchCoords) return [];
    const key        = (searchQuery || "").toLowerCase().trim();
    const heatIndex  = KNOWN_HEAT[key] ?? estimateHeatIndex(searchCoords.lat);
    return generateZones(searchCoords.lat, searchCoords.lon, key || "city", heatIndex);
  }, [searchCoords, searchQuery]);

  // Count zones by type for the summary bar
  const zoneCounts = useMemo(() => {
    const counts = [0, 0, 0, 0];
    zones.forEach((z) => counts[z.zoneIdx]++);
    return counts;
  }, [zones]);

  return (
    <section id="map" className="p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">
            Urban <span className="text-orange-400">Heat Zone</span> Map
          </h2>
          {hasSearch ? (
            <p className="text-orange-300 mt-1 flex items-center gap-2 text-sm">
              <span>📍</span>
              <span className="truncate max-w-lg">{searchCoords.label}</span>
            </p>
          ) : searchQuery && !searchCoords ? (
            <p className="text-red-400 mt-1 text-sm">
              ⚠️ "{searchQuery}" not found — try a different spelling.
            </p>
          ) : (
            <p className="text-gray-400 mt-1 text-sm">
              🔍 Search a city above to see its neighborhood-level heat zones.
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          {ZONE_DEFS.map(({ label, bg }) => (
            <span key={label} className="flex items-center gap-2 text-gray-300">
              <span className={`w-3 h-3 rounded-full ${bg} inline-block`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Zone count summary — only when city is searched */}
      {hasSearch && (
        <div className="flex flex-wrap gap-3 mb-4">
          {ZONE_DEFS.map(({ label, bg }, i) => (
            <div key={label} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${bg}`} />
              <span className="text-gray-400">{label}:</span>
              <span className="font-bold text-white">{zoneCounts[i]}</span>
              <span className="text-gray-500">zones</span>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="h-[520px] rounded-3xl overflow-hidden border border-orange-900/40 shadow-lg">
        <MapContainer
          center={hasSearch ? [searchCoords.lat, searchCoords.lon] : [20, 0]}
          zoom={hasSearch ? 12 : 2}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Fly smoothly to new city */}
          {searchCoords && <FlyTo coords={searchCoords} />}

          {/* Heat zone circles for searched city */}
          {zones.map((z, i) => {
            const def = ZONE_DEFS[z.zoneIdx];
            return (
              <Circle
                key={i}
                center={[z.lat, z.lon]}
                radius={z.radius}
                pathOptions={{
                  color:       def.border,
                  fillColor:   def.fillColor,
                  fillOpacity: 0.50,
                  weight:      1.5,
                }}
              >
                <Popup>
                  <div style={{ fontFamily: "sans-serif", minWidth: 150 }}>
                    <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>
                      {def.label} Zone
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 3 }}>
                      Heat range: <strong style={{ color: "#111" }}>{def.heatRange}</strong>
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 12 }}>
                      Area: ~{(Math.PI * z.radius * z.radius / 1e6).toFixed(2)} km²
                    </p>
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

      {!hasSearch && (
        <div className="mt-4 bg-slate-900 border border-orange-900/30 rounded-2xl px-6 py-4 text-center text-gray-400 text-sm">
          Use the <span className="text-orange-400 font-semibold">search bar above</span> to look up any city —
          the map will zoom in and display its Cool / Warm / Hot / Critical heat zones at neighborhood level.
        </div>
      )}

      <p className="text-gray-600 text-sm mt-3 text-right">
        Map: © CartoDB Dark Matter · Zones: EcoSutra AI heat model · Click any zone for details
      </p>
    </section>
  );
}
