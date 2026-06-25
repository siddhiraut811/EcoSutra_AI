import { useMemo } from "react";

// ── City-specific profiles ────────────────────────────────
const CITY_PROFILES = {
  pune:        { heat: 43, climate: "tropical", solar: "high",   water: "moderate", region: "India" },
  mumbai:      { heat: 42, climate: "coastal",  solar: "high",   water: "high",     region: "India" },
  delhi:       { heat: 47, climate: "arid",     solar: "high",   water: "low",      region: "India" },
  chennai:     { heat: 44, climate: "coastal",  solar: "high",   water: "moderate", region: "India" },
  bangalore:   { heat: 38, climate: "temperate",solar: "medium", water: "moderate", region: "India" },
  hyderabad:   { heat: 42, climate: "tropical", solar: "high",   water: "moderate", region: "India" },
  kolkata:     { heat: 41, climate: "humid",    solar: "medium", water: "high",     region: "India" },
  ahmedabad:   { heat: 46, climate: "arid",     solar: "high",   water: "low",      region: "India" },
  jaipur:      { heat: 47, climate: "arid",     solar: "high",   water: "low",      region: "India" },
  lucknow:     { heat: 44, climate: "tropical", solar: "high",   water: "moderate", region: "India" },
  dubai:       { heat: 49, climate: "desert",   solar: "high",   water: "very low", region: "UAE"   },
  phoenix:     { heat: 48, climate: "desert",   solar: "high",   water: "very low", region: "USA"   },
  singapore:   { heat: 35, climate: "tropical", solar: "high",   water: "high",     region: "SEA"   },
  tokyo:       { heat: 38, climate: "temperate",solar: "medium", water: "high",     region: "Japan" },
  amsterdam:   { heat: 30, climate: "temperate",solar: "low",    water: "high",     region: "EU"    },
  london:      { heat: 29, climate: "temperate",solar: "low",    water: "high",     region: "EU"    },
  beijing:     { heat: 40, climate: "temperate",solar: "medium", water: "moderate", region: "China" },
  jakarta:     { heat: 43, climate: "tropical", solar: "high",   water: "high",     region: "SEA"   },
  bangkok:     { heat: 45, climate: "tropical", solar: "high",   water: "high",     region: "SEA"   },
  cairo:       { heat: 44, climate: "desert",   solar: "high",   water: "low",      region: "Africa"},
  lagos:       { heat: 41, climate: "tropical", solar: "high",   water: "high",     region: "Africa"},
  "new york":  { heat: 36, climate: "temperate",solar: "medium", water: "high",     region: "USA"   },
  "los angeles":{ heat: 39,climate: "arid",     solar: "high",   water: "low",      region: "USA"   },
  karachi:     { heat: 46, climate: "arid",     solar: "high",   water: "low",      region: "Pakistan"},
  seoul:       { heat: 37, climate: "temperate",solar: "medium", water: "moderate", region: "Korea" },
};

// ── Template generators ───────────────────────────────────
function getTreeZones(cityKey, profile, cityLabel) {
  const city = cityLabel || cityKey;

  const zonesByClimate = {
    arid:      ["Along major road medians (reduce heat absorption by 30%)", "Around public buildings and government complexes", "Dry riverbeds and nullahs (seasonal stream edges)", "Boundary walls of industrial zones", "Peripheral ring-road plantations"],
    desert:    ["Highway shoulders and interchange islands", "Around residential compounds to block solar radiation", "Treated wastewater corridors", "Rooftop gardens on commercial buildings", "Canal and falaj (irrigation channel) edges"],
    tropical:  ["River and canal banks (riverine corridors)", "School and hospital campuses", "Railway line margins", "Slum-adjacent open plots for community green spaces", "Low-lying waterlogged zones converted to wetland forests"],
    coastal:   ["Mangrove restoration along coastline", "Creek and estuary edges", "Beach-adjacent buffer zones", "Port and industrial periphery", "Urban seafront promenades"],
    humid:     ["Wetland edges and flood plains", "Industrial buffer zones", "Road dividers in low-canopy areas", "Public park infill planting", "Drainage channel embankments"],
    temperate: ["Parks and squares with canopy gaps", "Cycling route corridors", "School grounds and university campuses", "Brownfield and post-industrial sites", "River and canal towpaths"],
  };

  const climate = profile?.climate ?? "tropical";
  return (zonesByClimate[climate] ?? zonesByClimate.tropical).map((area, i) => ({
    id: i,
    area,
    species: getSpecies(climate, i),
    coverage: `${12 + i * 4}% shade target`,
  }));
}

function getSpecies(climate, idx) {
  const table = {
    arid:      ["Neem (Azadirachta indica)", "Peepal (Ficus religiosa)", "Babool (Acacia nilotica)", "Khejri (Prosopis cineraria)", "Arjun (Terminalia arjuna)"],
    desert:    ["Ghaf (Prosopis cineraria)", "Date Palm (Phoenix dactylifera)", "Sidr (Ziziphus spina-christi)", "Acacia tortilis", "Tamarix aphylla"],
    tropical:  ["Rain Tree (Samanea saman)", "Teak (Tectona grandis)", "Gulmohar (Delonix regia)", "Banyan (Ficus benghalensis)", "Mango (Mangifera indica)"],
    coastal:   ["Red Mangrove (Rhizophora mangle)", "Casuarina (Casuarina equisetifolia)", "Sea Hibiscus (Talipariti tiliaceum)", "Coconut Palm", "Screw Pine (Pandanus)"],
    humid:     ["Sundari (Heritiera fomes)", "Rain Tree", "Bamboo (Bambusa spp.)", "Coconut Palm", "Jackfruit (Artocarpus heterophyllus)"],
    temperate: ["London Plane (Platanus × acerifolia)", "Lime Tree (Tilia cordata)", "Oak (Quercus robur)", "Cherry (Prunus avium)", "Birch (Betula pendula)"],
  };
  const list = table[climate] ?? table.tropical;
  return list[idx % list.length];
}

function getConservationAreas(cityKey, profile, cityLabel) {
  const byClimate = {
    arid:      ["Remaining grassland patches at city fringe — prevent conversion to construction", "Old growth trees in heritage/religious sites (temples, mosques)", "Seasonal pond and step-well ecosystems", "Ravine and gorge systems as natural windbreaks", "Green buffer zones around water treatment plants"],
    desert:    ["Wadis (seasonal riverbeds) — ban development to preserve infiltration", "Existing oasis vegetation clusters", "Protected dune ecosystems at city edges", "Falcon and migratory bird resting corridors", "Underground aquifer recharge zones"],
    tropical:  ["Existing forest patches (declare as city biodiversity parks)", "Wetlands and seasonal floodplains", "Sacred groves (Dev van / temple forests)", "Mangrove estuaries and tidal zones", "Butterfly and pollinator corridors along rivers"],
    coastal:   ["Mangrove belts — legally protect against encroachment", "Coral reef adjacent zones", "Sea turtle nesting beaches", "Creek and backwater ecosystems", "Coastal sand dune vegetation"],
    humid:     ["Sundarbans-type mangrove patches", "Ox-bow lakes and abandoned channels", "Rice paddy wetland mosaics at fringe", "Heritage ponds and tanks", "Floodplain forests"],
    temperate: ["Ancient woodland remnants", "Urban commons and heathland", "River floodplains and riparian buffers", "Chalk grassland and meadow fragments", "Green wedges connecting city to countryside"],
  };
  const climate = profile?.climate ?? "tropical";
  return (byClimate[climate] ?? byClimate.tropical).map((area, i) => ({
    id: i, area, urgency: i < 2 ? "Critical" : i < 4 ? "High" : "Medium",
  }));
}

function getCleanEnergy(profile) {
  const solar = profile?.solar ?? "medium";
  const water = profile?.water ?? "moderate";

  const strategies = [];

  if (solar === "high") {
    strategies.push({ icon: "☀️", title: "Rooftop Solar Mandate",     desc: "Buildings >1000 m² must install solar — can offset 40% of peak cooling load.",  saving: "−2.1°C urban heat" });
    strategies.push({ icon: "🏙️", title: "Solar Pavements",           desc: "Replace dark asphalt on plazas with solar-integrated cool paving (albedo > 0.6).", saving: "−1.8°C surface"    });
  } else {
    strategies.push({ icon: "💨", title: "Wind Power Integration",    desc: "Small urban wind turbines at rooftop level supplement cooling during peak hours.",  saving: "−15% grid load"    });
    strategies.push({ icon: "🌊", title: "Tidal / River Micro-hydro", desc: "Capture energy from water flows to power local cooling systems.",                   saving: "Carbon neutral"    });
  }

  if (water === "high" || water === "moderate") {
    strategies.push({ icon: "💧", title: "Evaporative Cooling Network",desc: "District-scale misting + cool water spray linked to greywater recycling.",         saving: "−4°C ambient"      });
    strategies.push({ icon: "🌊", title: "Blue Corridors",            desc: "Restore water bodies and canals as natural AC — each hectare cools 1–2°C nearby.",  saving: "−2°C nearby zones" });
  } else {
    strategies.push({ icon: "🔄", title: "Waste Heat Recovery",       desc: "Capture AC exhaust and industrial waste heat for district hot-water systems.",       saving: "−12% heat emission" });
    strategies.push({ icon: "🌿", title: "Biogas from Waste",         desc: "Convert organic municipal waste to biogas, replacing diesel generators.",            saving: "−800 kg CO₂/yr ea." });
  }

  strategies.push({ icon: "🔋", title: "EV + Smart Charging",        desc: "EV adoption cuts tail-pipe waste heat in dense city cores by up to 25%.",            saving: "−0.8°C at street"  });
  strategies.push({ icon: "🏗️", title: "Green Roof Policy",          desc: "Mandate vegetated roofs on new constructions — insulate + cool + absorb rain.",      saving: "−3°C roof surface"  });

  return strategies;
}

function climateFromLatLon(lat) {
  const a = Math.abs(lat);
  if (a < 15) return "tropical";
  if (a < 25) return "arid";
  if (a < 35) return "arid";
  if (a < 50) return "temperate";
  return "temperate";
}

// ── Component ─────────────────────────────────────────────
export default function CoolingSolutions({ searchQuery, searchCoords }) {
  const cityKey   = (searchQuery || "").toLowerCase().trim();
  const profile   = CITY_PROFILES[cityKey] ?? (searchCoords ? { climate: climateFromLatLon(searchCoords.lat), solar: "medium", water: "moderate" } : null);
  const cityLabel = searchQuery
    ? searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)
    : null;

  const treeZones  = useMemo(() => getTreeZones(cityKey, profile, cityLabel),  [cityKey, profile, cityLabel]);
  const conserve   = useMemo(() => getConservationAreas(cityKey, profile, cityLabel), [cityKey, profile, cityLabel]);
  const cleanItems = useMemo(() => getCleanEnergy(profile), [profile]);

  const URGENCY_STYLE = {
    Critical: "bg-red-900/40 text-red-300 border-red-700/40",
    High:     "bg-orange-900/40 text-orange-300 border-orange-700/40",
    Medium:   "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  };

  return (
    <section id="solutions" className="px-10 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="bg-green-900/50 text-green-300 px-4 py-1 rounded-full text-sm font-medium">
          Evidence-Based Strategies
        </span>
        <h2 className="text-3xl font-bold mt-4">
          {cityLabel
            ? <>{cityLabel} — <span className="text-orange-400">Cooling Action Plan</span></>
            : <>Cooling Solutions <span className="text-orange-400">Guide</span></>}
        </h2>
        {profile ? (
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            <span className="bg-slate-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-slate-700">
              🌡️ Heat Index ~{profile.heat ?? "—"}°C
            </span>
            <span className="bg-slate-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-slate-700">
              🌤️ Climate: {profile.climate}
            </span>
            <span className="bg-slate-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-slate-700">
              ☀️ Solar potential: {profile.solar}
            </span>
            <span className="bg-slate-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-slate-700">
              💧 Water availability: {profile.water}
            </span>
          </div>
        ) : (
          <p className="text-gray-400 mt-2 text-sm">
            🔍 Search a city above for location-specific cooling recommendations.
          </p>
        )}
      </div>

      {/* ── Section 1: Tree Planting ── */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
          🌳 <span>Tree Planting <span className="text-green-400">Zones</span></span>
        </h3>
        <p className="text-gray-400 text-sm mb-5">
          Priority areas for maximum cooling impact — selected for {cityLabel ?? "your city"}'s climate and land-use patterns.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {treeZones.map((z) => (
            <div key={z.id} className="bg-slate-900 rounded-2xl border border-green-700/20 hover:border-green-600/40 transition-colors p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🌱</span>
                <div>
                  <p className="font-semibold text-gray-100 text-sm leading-snug">{z.area}</p>
                  <p className="text-green-400 text-xs mt-2 font-medium">Recommended: {z.species}</p>
                  <p className="text-gray-500 text-xs mt-1">Target: {z.coverage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Conservation ── */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
          🏞️ <span>Areas to <span className="text-sky-400">Reserve & Protect</span></span>
        </h3>
        <p className="text-gray-400 text-sm mb-5">
          Existing ecosystems that must be legally protected to prevent further heat island expansion.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {conserve.map((c) => (
            <div key={c.id} className="bg-slate-900 rounded-2xl border border-sky-700/20 hover:border-sky-600/40 transition-colors p-5 flex items-start gap-4">
              <span className="text-2xl mt-0.5">🔒</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-100 text-sm leading-snug">{c.area}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full border ${URGENCY_STYLE[c.urgency]}`}>
                  {c.urgency} priority
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Clean Energy ── */}
      <div>
        <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
          ⚡ <span>Clean Energy & <span className="text-orange-400">Cooling Tech</span></span>
        </h3>
        <p className="text-gray-400 text-sm mb-5">
          Technology interventions tailored to {cityLabel ?? "your city"}'s solar potential and water availability.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cleanItems.map((item) => (
            <div key={item.title} className="bg-slate-900 rounded-2xl border border-orange-700/20 hover:border-orange-600/40 transition-colors p-5">
              <span className="text-3xl">{item.icon}</span>
              <h4 className="font-semibold text-gray-100 mt-3 text-sm">{item.title}</h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
              <p className="text-orange-400 font-bold text-xs mt-3">{item.saving}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
