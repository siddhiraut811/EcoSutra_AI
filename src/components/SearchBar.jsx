import { useState, useRef, useCallback } from "react";

const SUGGESTIONS = [
  "Mumbai", "Delhi", "Singapore", "Tokyo", "Phoenix", "Amsterdam",
  "London", "New York", "Dubai", "Beijing", "Los Angeles", "Seoul",
];

export default function SearchBar({ onSearch, searchQuery }) {
  const [input, setInput] = useState(searchQuery || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const reqIdRef = useRef(0);

  // Core geocode function — takes the query directly (no stale closure)
  const geocode = useCallback(async (query) => {
    if (!query.trim()) {
      onSearch("", null);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myId = ++reqIdRef.current;

    setLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" }, signal: controller.signal }
      );
      const data = await res.json();

      // Ignore stale responses
      if (myId !== reqIdRef.current) return;

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onSearch(query, { lat: parseFloat(lat), lon: parseFloat(lon), label: display_name });
      } else {
        onSearch(query, null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      onSearch(query, null);
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, [onSearch]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim().length > 0) {
      setSuggestions(
        SUGGESTIONS.filter((s) =>
          s.toLowerCase().startsWith(val.toLowerCase())
        ).slice(0, 5)
      );
    } else {
      setSuggestions([]);
      onSearch("", null);
    }
  };

  // Form submit — only source of truth for triggering geocode
  const handleSubmit = (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query) return;
    geocode(query);
  };

  // Suggestion/chip pick — pass value directly, avoid stale closure
  const pickSuggestion = (city) => {
    setInput(city);
    setSuggestions([]);
    geocode(city);
  };

  const handleClear = () => {
    if (abortRef.current) abortRef.current.abort();
    setInput("");
    setSuggestions([]);
    setLoading(false);
    onSearch("", null);
  };

  return (
    <section id="search" className="px-10 py-8">
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-gray-400 text-sm mb-3 uppercase tracking-wider font-medium">
          Search any city or area
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-slate-900 border border-orange-500/40 hover:border-orange-500/70 focus-within:border-orange-500 transition-colors rounded-2xl overflow-visible shadow-lg shadow-orange-900/10">
            <span className="pl-5 text-orange-400 text-xl flex-shrink-0">🔍</span>

            <input
              type="text"
              value={input}
              onChange={handleChange}
              placeholder="Type a city or area name… e.g. Mumbai, Tokyo, Phoenix"
              aria-label="Search city or area"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 outline-none text-base"
            />

            {input && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="px-3 text-gray-500 hover:text-gray-300 transition-colors text-xl"
              >
                ×
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="m-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-colors px-5 py-2.5 rounded-xl font-semibold text-sm flex-shrink-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Searching
                </span>
              ) : "Search"}
            </button>
          </div>

          {suggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label="City suggestions"
              className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-orange-500/30 rounded-xl overflow-hidden z-50 shadow-xl"
            >
              {suggestions.map((s) => (
                <li key={s} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="w-full text-left px-5 py-3 text-gray-300 hover:bg-orange-500/10 hover:text-orange-300 transition-colors flex items-center gap-3"
                  >
                    <span className="text-orange-500">📍</span> {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Quick-select chips */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {["Mumbai", "Singapore", "Amsterdam", "Tokyo", "Phoenix", "Delhi"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => pickSuggestion(city)}
              className="px-3 py-1 rounded-full text-xs border border-slate-700 text-gray-400 hover:border-orange-500/50 hover:text-orange-300 transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
