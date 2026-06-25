import { useState, useEffect, useCallback, useRef } from "react";

const CHALLENGES = [
  { id: "no_meat_week",   title: "No Meat Week",          desc: "Skip all meat for 7 days",                   reward: 120, icon: "🥦", difficulty: "Easy"   },
  { id: "cycle_to_work",  title: "Cycle to Work",          desc: "Replace car with cycling for 5 commutes",    reward: 180, icon: "🚲", difficulty: "Easy"   },
  { id: "solar_pledge",   title: "Solar Pledge",           desc: "Switch one appliance to solar/renewable",    reward: 300, icon: "☀️", difficulty: "Medium" },
  { id: "plant_10_trees", title: "Plant 10 Trees",         desc: "Participate in a tree plantation drive",     reward: 500, icon: "🌳", difficulty: "Medium" },
  { id: "zero_flight",    title: "Zero Flight Month",      desc: "Avoid air travel for 30 days",               reward: 600, icon: "✈️", difficulty: "Hard"   },
  { id: "vegan_month",    title: "Go Vegan for a Month",   desc: "Full plant-based diet for 30 days",          reward: 700, icon: "🌱", difficulty: "Hard"   },
  { id: "carpool_week",   title: "Carpool Week",           desc: "Share rides every day for a week",           reward: 200, icon: "🚗", difficulty: "Easy"   },
  { id: "energy_fast",    title: "Energy Fast Day",        desc: "Cut home electricity use by 80% for 1 day",  reward: 150, icon: "💡", difficulty: "Medium" },
];

const DIFF_STYLE = {
  Easy:   "bg-green-900/40 text-green-300 border-green-700/40",
  Medium: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  Hard:   "bg-red-900/40 text-red-300 border-red-700/40",
};

function getBadge(score) {
  if (score < 5)  return { label: "🌍 Planet Hero",   color: "text-green-400",  bg: "bg-green-900/30"  };
  if (score < 10) return { label: "🌿 Eco Warrior",   color: "text-lime-400",   bg: "bg-lime-900/30"   };
  if (score < 20) return { label: "⚡ Green Changer", color: "text-yellow-400", bg: "bg-yellow-900/30" };
  if (score < 35) return { label: "🔥 Heat Fighter",  color: "text-orange-400", bg: "bg-orange-900/30" };
  return               { label: "🚨 High Emitter",  color: "text-red-400",    bg: "bg-red-900/30"    };
}

// Default challenges state: ALL accepted
const DEFAULT_CHALLENGES = Object.fromEntries(CHALLENGES.map((c) => [c.id, "accepted"]));

function loadMyEntry() {
  try { return JSON.parse(localStorage.getItem("eco_my_entry")) || null; } catch { return null; }
}
function loadChallenges() {
  try { return JSON.parse(localStorage.getItem("eco_challenges")) || DEFAULT_CHALLENGES; } catch { return DEFAULT_CHALLENGES; }
}

export default function Leaderboard({ currentFootprint }) {
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [liveTag,     setLiveTag]     = useState(null);  // "updated X seconds ago"
  const [myName,      setMyName]      = useState("");
  const [myScore,     setMyScore]     = useState(currentFootprint ?? "");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [myEntry,     setMyEntry]     = useState(loadMyEntry);
  const [challenges,  setChallenges]  = useState(loadChallenges);
  const [activeTab,   setActiveTab]   = useState("leaderboard");
  const [filterDiff,  setFilterDiff]  = useState("All");
  const lastFetchRef = useRef(null);

  // ── Auto-fill score from calculator ──────────────────
  useEffect(() => {
    if (currentFootprint && !submitted) setMyScore(currentFootprint);
  }, [currentFootprint, submitted]);

  // ── Persist challenges ────────────────────────────────
  useEffect(() => {
    localStorage.setItem("eco_challenges", JSON.stringify(challenges));
  }, [challenges]);

  // ── Fetch leaderboard from API ────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res  = await fetch("/api/leaderboard");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data.sort((a, b) => a.score - b.score));
        lastFetchRef.current = Date.now();
        setLiveTag("just now");
      }
    } catch {
      // API not yet running — silently keep current entries
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  // Poll every 10 seconds
  useEffect(() => {
    const id = setInterval(() => {
      fetchLeaderboard();
      // Update "X seconds ago" label
      if (lastFetchRef.current) {
        const sec = Math.round((Date.now() - lastFetchRef.current) / 1000);
        setLiveTag(sec < 5 ? "just now" : `${sec}s ago`);
      }
    }, 10000);
    return () => clearInterval(id);
  }, [fetchLeaderboard]);

  // ── Submit score ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name  = myName.trim();
    const score = parseFloat(myScore);
    if (!name || isNaN(score) || score <= 0) return;

    setSubmitting(true);
    try {
      const res  = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data.sort((a, b) => a.score - b.score));
        setLiveTag("just now");
      }
    } catch {
      // Fallback: update locally
      const basePoints = Math.round(Math.max(0, (30 - score)) * 20);
      const updated = { name, score: Math.round(score * 10) / 10, points: basePoints, completed: [], isMe: true };
      setEntries((prev) => [...prev.filter((e) => e.name !== name), updated].sort((a, b) => a.score - b.score));
    }

    // Save user entry + auto-accept ALL challenges on first join
    const basePoints = Math.round(Math.max(0, (30 - score)) * 20);
    const entry = {
      name, score: Math.round(score * 10) / 10,
      points: basePoints, completed: [], isMe: true,
    };
    setMyEntry(entry);
    localStorage.setItem("eco_my_entry", JSON.stringify(entry));

    // Auto-accept every challenge
    setChallenges(DEFAULT_CHALLENGES);

    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setActiveTab("challenges"), 800);
  };

  // ── Mark challenge done ───────────────────────────────
  const completeChallenge = async (ch) => {
    if (!myEntry) return;
    if (challenges[ch.id] !== "accepted") return;

    // Optimistic UI
    setChallenges((prev) => ({ ...prev, [ch.id]: "completed" }));
    const updatedEntry = {
      ...myEntry,
      points: (myEntry.points || 0) + ch.reward,
      completed: [...(myEntry.completed || []), ch.id],
    };
    setMyEntry(updatedEntry);
    localStorage.setItem("eco_my_entry", JSON.stringify(updatedEntry));

    // Update leaderboard
    try {
      const res  = await fetch("/api/leaderboard/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: myEntry.name, challengeId: ch.id, reward: ch.reward }),
      });
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data.sort((a, b) => a.score - b.score));
    } catch {
      setEntries((prev) =>
        prev.map((en) =>
          en.name === myEntry.name
            ? { ...en, points: updatedEntry.points, completed: updatedEntry.completed }
            : en
        ).sort((a, b) => a.score - b.score)
      );
    }
  };

  const abandonChallenge = (id) =>
    setChallenges((prev) => ({ ...prev, [id]: "accepted" }));

  const sorted    = [...entries].sort((a, b) => a.score - b.score);
  const topThree  = sorted.slice(0, 3);
  const filtered  = filterDiff === "All" ? CHALLENGES : CHALLENGES.filter((c) => c.difficulty === filterDiff);

  const completedCount = Object.values(challenges).filter((s) => s === "completed").length;

  return (
    <section id="leaderboard" className="px-10 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="bg-purple-900/50 text-purple-300 px-4 py-1 rounded-full text-sm font-medium">
          🏆 Real-Time Community Challenge
        </span>
        <h2 className="text-3xl font-bold mt-4">
          Leaderboard & <span className="text-orange-400">Challenges</span>
        </h2>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">
          Submit your carbon footprint, climb the rankings, and complete
          eco challenges to earn points — shared live with all players.
        </p>
        {liveTag && (
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs text-green-400 bg-green-900/20 border border-green-700/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live · updated {liveTag}
          </span>
        )}
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 mb-10">
        {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
          if (!entry) return <div key={i} className="w-32" />;
          const heights = ["h-24", "h-32", "h-20"];
          const medals  = ["🥈", "🥇", "🥉"];
          const ranks   = [2, 1, 3];
          const badge   = getBadge(entry.score);
          return (
            <div key={entry.name} className="flex flex-col items-center gap-2 w-32">
              <span className="text-3xl">{medals[i]}</span>
              <div className={`${badge.bg} rounded-xl px-3 py-1 text-xs font-semibold ${badge.color} text-center`}>
                {badge.label}
              </div>
              <p className="font-bold text-sm text-center truncate w-full text-center">{entry.name}</p>
              <p className="text-orange-400 font-bold text-sm">{entry.score}t CO₂</p>
              <div className={`w-full rounded-t-xl border ${heights[i]} flex items-end justify-center pb-2 ${
                i === 1 ? "bg-yellow-500/30 border-yellow-500/50" :
                i === 0 ? "bg-gray-400/20 border-gray-400/40" :
                          "bg-orange-700/20 border-orange-700/40"
              }`}>
                <span className="text-gray-400 text-xs font-bold">#{ranks[i]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "leaderboard", label: "🏅 Rankings" },
          { key: "challenges",  label: `🎯 Challenges${completedCount ? ` (${completedCount}✓)` : ""}` },
          { key: "submit",      label: "📤 Submit Score" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            aria-pressed={activeTab === key}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-orange-500 text-white"
                : "bg-slate-900 text-gray-400 hover:text-gray-200 border border-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── RANKINGS ── */}
      {activeTab === "leaderboard" && (
        <div className="bg-slate-900 rounded-2xl border border-orange-500/20 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading live rankings…</div>
          ) : (
            <table className="w-full text-sm" aria-label="Carbon footprint leaderboard">
              <caption className="sr-only">Users ranked by lowest carbon footprint</caption>
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th scope="col" className="px-6 py-3 text-left text-gray-400 font-medium">Rank</th>
                  <th scope="col" className="px-4 py-3 text-left text-gray-400 font-medium">Player</th>
                  <th scope="col" className="px-4 py-3 text-left text-gray-400 font-medium">Badge</th>
                  <th scope="col" className="px-4 py-3 text-right text-gray-400 font-medium">CO₂ t/yr</th>
                  <th scope="col" className="px-4 py-3 text-right text-gray-400 font-medium">Done</th>
                  <th scope="col" className="px-6 py-3 text-right text-gray-400 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => {
                  const badge = getBadge(entry.score);
                  const isMe  = entry.isMe || entry.name === myEntry?.name;
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                  return (
                    <tr key={entry.name + i}
                      className={`border-b border-slate-800 transition-colors ${
                        isMe ? "bg-orange-500/10 border-l-4 border-l-orange-500" : "hover:bg-slate-800/30"
                      }`}
                    >
                      <td className="px-6 py-3 font-bold text-lg">{medal}</td>
                      <td className="px-4 py-3 font-medium">
                        {entry.name}
                        {isMe && <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">you</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.bg} ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-orange-400 font-bold">{entry.score}</td>
                      <td className="px-4 py-3 text-right text-green-400">{entry.completed?.length ?? 0}</td>
                      <td className="px-6 py-3 text-right font-semibold text-purple-300">{entry.points?.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── CHALLENGES ── */}
      {activeTab === "challenges" && (
        <div>
          {!myEntry && (
            <div className="bg-orange-900/20 border border-orange-700/30 rounded-xl px-5 py-3 mb-5 text-sm text-orange-300 flex items-center gap-3">
              <span>⚠️</span>
              <span>Submit your score first — all challenges will be auto-enrolled for you.</span>
            </div>
          )}

          {myEntry && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-xl px-5 py-3 mb-5 text-sm text-green-300 flex items-center gap-3">
              <span>✅</span>
              <span>All {CHALLENGES.length} challenges are active for you. Mark them done as you complete them to earn points!</span>
            </div>
          )}

          <div className="flex gap-2 mb-5 flex-wrap">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button key={d} onClick={() => setFilterDiff(d)} aria-pressed={filterDiff === d}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filterDiff === d ? "border-orange-500 bg-orange-500/20 text-orange-300" : "border-slate-700 text-gray-400 hover:border-orange-500/40"
                }`}
              >{d}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((ch) => {
              const state  = challenges[ch.id] ?? (myEntry ? "accepted" : null);
              const isDone = state === "completed";
              const isActive = state === "accepted";
              return (
                <div key={ch.id} className={`bg-slate-900 rounded-2xl border p-5 transition-colors ${
                  isDone   ? "border-green-600/40 bg-green-900/10" :
                  isActive ? "border-orange-500/40" :
                             "border-slate-700/50"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{ch.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-100">{ch.title}</h3>
                        <p className="text-gray-400 text-sm mt-0.5">{ch.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFF_STYLE[ch.difficulty]}`}>
                            {ch.difficulty}
                          </span>
                          <span className="text-purple-400 text-xs font-semibold">+{ch.reward} pts</span>
                          {isActive && <span className="text-orange-400 text-xs animate-pulse">● In progress</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {isDone && (
                        <span className="text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-900/30 border border-green-700/30">
                          ✅ Done +{ch.reward}pts
                        </span>
                      )}
                      {isActive && myEntry && (
                        <>
                          <button onClick={() => completeChallenge(ch)}
                            className="bg-green-600 hover:bg-green-700 transition-colors text-white text-xs font-semibold px-4 py-1.5 rounded-lg">
                            ✓ Mark Done
                          </button>
                          <button onClick={() => abandonChallenge(ch.id)}
                            className="text-gray-500 hover:text-gray-300 text-xs px-4 py-1 rounded-lg border border-slate-700">
                            Skip
                          </button>
                        </>
                      )}
                      {!myEntry && (
                        <span className="text-gray-500 text-xs px-3 py-1 border border-slate-700 rounded-lg">
                          Join first
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUBMIT ── */}
      {activeTab === "submit" && (
        <div className="max-w-md mx-auto">
          {submitted ? (
            <div className="bg-green-900/20 border border-green-600/40 rounded-2xl p-8 text-center">
              <span className="text-5xl">🎉</span>
              <h3 className="text-xl font-bold mt-4">Score Submitted!</h3>
              <p className="text-gray-400 mt-2">
                Welcome, <span className="text-orange-400 font-semibold">{myEntry?.name}</span>! All {CHALLENGES.length} challenges are now active for you.
              </p>
              <div className="mt-4 bg-slate-900 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Your footprint</p>
                <p className="text-4xl font-bold text-orange-400 mt-1">{myEntry?.score}t <span className="text-lg">CO₂/yr</span></p>
                <p className={`text-sm font-semibold mt-2 ${getBadge(myEntry?.score).color}`}>
                  {getBadge(myEntry?.score).label}
                </p>
              </div>
              <button onClick={() => setActiveTab("challenges")}
                className="mt-5 bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-2.5 rounded-xl font-semibold text-sm">
                🎯 View My Challenges →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-orange-500/20 p-8 space-y-5">
              <h3 className="text-xl font-bold">Join the Leaderboard</h3>
              <p className="text-gray-400 text-sm">
                Enter your name and carbon footprint from the calculator above. All eco challenges will be auto-enrolled for you.
              </p>

              <div>
                <label htmlFor="lb_name" className="block text-sm font-medium text-gray-300 mb-2">Your name / username</label>
                <input id="lb_name" type="text" required value={myName} onChange={(e) => setMyName(e.target.value)}
                  placeholder="e.g. Priya S."
                  className="w-full bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none transition-colors" />
              </div>

              <div>
                <label htmlFor="lb_score" className="block text-sm font-medium text-gray-300 mb-2">Carbon footprint (tonnes CO₂/yr)</label>
                <input id="lb_score" type="number" required step="0.1" min="0.1" max="200"
                  value={myScore} onChange={(e) => setMyScore(e.target.value)}
                  placeholder="e.g. 8.4"
                  className="w-full bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none transition-colors" />
                {currentFootprint && (
                  <p className="text-xs text-orange-400 mt-1.5 flex items-center gap-1">
                    <span>💡</span> Auto-filled from your calculator ({currentFootprint}t)
                  </p>
                )}
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-colors py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                {submitting ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Submitting…</>
                ) : "🏆 Submit & Join Leaderboard"}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
