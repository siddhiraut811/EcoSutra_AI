import { useMemo } from "react";

// Default view: Mumbai bounding box
const DEFAULT_BBOX = "72.7,18.9,73.0,19.1";

function coordsToBbox(lat, lon, delta = 0.15) {
  return `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
}

export default function MapSection({ searchCoords, searchQuery }) {
  const mapSrc = useMemo(() => {
    const bbox = searchCoords
      ? coordsToBbox(searchCoords.lat, searchCoords.lon)
      : DEFAULT_BBOX;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=hot`;
  }, [searchCoords]);

  return (
    <section id="map" className="p-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">
            Urban <span className="text-orange-400">Heat Zone</span> Map
          </h2>
          {searchQuery && searchCoords ? (
            <p className="text-orange-300 mt-1 flex items-center gap-2">
              <span>📍</span>
              <span className="truncate max-w-md">{searchCoords.label}</span>
            </p>
          ) : searchQuery && !searchCoords ? (
            <p className="text-red-400 mt-1">
              ⚠️ Location "{searchQuery}" not found — showing default view.
            </p>
          ) : (
            <p className="text-gray-400 mt-1">
              Explore city infrastructure and identify heat-vulnerable zones.
            </p>
          )}
        </div>
        <div className="flex gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Warm zone
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Hot zone
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Critical zone
          </span>
        </div>
      </div>

      <div className="h-[500px] rounded-3xl overflow-hidden border border-orange-900/30">
        <iframe
          key={mapSrc}
          title="Urban Heat Zone Map"
          width="100%"
          height="100%"
          src={mapSrc}
        />
      </div>

      <p className="text-gray-600 text-sm mt-3 text-right">
        Base map: OpenStreetMap · Thermal overlay powered by EcoSutra AI sensors
      </p>
    </section>
  );
}
