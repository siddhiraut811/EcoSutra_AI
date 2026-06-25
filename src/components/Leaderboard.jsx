import { useState, useEffect } from "react";

const CHALLENGES = [
  { id: "no_meat_week",    title: "No Meat Week",         desc: "Skip all meat for 7 days",                  reward: 120,  icon: "🥦", difficulty: "Easy"   },
  { id: "cycle_to_work",   title: "Cycle to Work",        desc: "Replace car with cycling for 5 commutes",   reward: 180,  icon: "🚲", difficulty: "Easy"   },
  { id: "solar_pledge",    title: "Solar Pledge",         desc: "Switch one appliance to solar/renewable",   reward: 300,  icon: "☀️", difficulty: "Medium" },
  { id: "plant_10_trees",  title: "Plant 10 Trees",       desc: "Participate in a tree plantation drive",    reward: 500,  icon: "🌳", difficulty: "Medium" },
  { id: "zero_flight",     title: "Zero Flight Month",    desc: "Avoid air travel for 30 days",              reward: 600,  icon: "✈️", difficulty: "Hard"   },
  { id: "vegan_month",     title: "Go Vegan for a Month", desc: "Full plant-based diet for 30 days",         reward: 700,  icon: "🌱", difficulty: "Hard"   },
  { id: "carpool_week",    title: "Carpool Week",         desc: "Share rides every day for a week",          reward: 200,  icon: "🚗", difficulty: "Easy"   },
  { id: "energy_fast",     title: "Energy Fast Day",      desc: "Cut home electricity use by 80% for 1 day",reward: 150,  icon: "💡", difficulty: "Medium" },
];

const DIFFICULTY_COLORS = {
  Easy:   "bg-green-900/40 text-green-300 border-green-700/40",
  Medium: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  Hard:   "bg-red-900/40 text-red-300 border-red-700/40",
};

function getBadge(score) {
  if (score < 5)  return { label: "🌍 Planet Hero",    color: "text-green-400",  bg: "bg-green-900/30"  };
  if (score < 10) return { label: "🌿 Eco Warrior",    color: "text-lime-400",   bg: "bg-lime-900/30"   };
  if (score < 20) return { label: "⚡ Green Changer",  color: "text-yellow-400", bg: "bg-yellow-900/30" };
  if (score < 35) return { label: "🔥 Heat Fighter",   color: "text-orange-400", bg: "bg-orange-900/30" };
  return               { label: "🚨 High Emitter",   color: "text-red-400",    bg: "bg-red-900/30"    };
}

const SEED_ENTRIES = [
  { name: "Priya S.",   score: 3.2,  points: 1200, completed: ["no_meat_week","cycle_to_work","vegan_month"] },
  { name: "Liam K.",    score: 4.8,  points: 980,  completed: ["cycle_to_work","plant_10_trees"]             },
  { name: "Mei L.",     score: 6.1,  points: 870,  completed: ["no_meat_week","solar_pledge"]               },
  { name: "Arjun R.",   score: 7.5,  points: 720,  completed: ["carpool_week","energy_fast"]                },
  { name: "Sofia V.",   score: 9.2,  points: 650,  completed: ["no_meat_week"]                              },
  { name: "Omar H.",    score: 11.4, points: 510,  completed: ["carpool_week"]                              },
  { name: "Yuki T.",    score: 13.0, points: 420,  completed: []                                            },
];

export default function Leaderboard({ currentFootprint }) {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem("eco_leaderboard");
      return saved ? JSON.parse(saved) : SEED_ENTRIES;
    } catch { return SEED_ENTRIES; }
  });

  const [myName,       setMyName]       = useState("");
  const [myScore,      setMyScore]      = useState(currentFootprint ?? "");
  const [submitted,    setSubmitted]    = useState(false);
  const [myEntry,      setMyEntry]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("eco_my_entry")) || null; } catch { return null; }
  });
  const [challenges,   setChallenges]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("eco_challenges")) || {}; } catch { return {}; }
  });
  const [activeTab,    setActiveTab]    = useState("leaderboard");
  const [filterDiff,   setFilterDiff]   = useState("All");

  // Keep score in sync if calculator updates it
  useEffect(() => {
    if (currentFootprint && !submitted) setMyScore(currentFootprint);
  }, [currentFootprint, submitted]);

  // Persist
  useEffect(() => {
    localStorage.setItem("eco_leaderboard", JSON.stringify(entries));
  }, [entries]);
  useEffect(() => {
    localStorage.setItem("eco_challenges", JSON.stringify(challenges));
  }, [challenges]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name  = myName.trim();
    const score = parseFloat(myScore);
    if (!name || isNaN(score) || score <= 0) return;

    const existingPoints =
      entries.find((en) => en.name === name)?.points ?? 0;

    const entry = {
      name,
      score: Math.round(score * 10) / 10,
      points: existingPoints + Math.round(Math.max(0, (30 - score)) * 20),
      completed: myEntry?.completed ?? [],
      isMe: true,
    };

    setMyEntry(entry);
    localStorage.setItem("eco_my_entry", JSON.stringify(entry));

    setEntries((prev) => {
      const filtered = prev.filter((en) => en.name !== name);
      return [...filtered, entry].sort((a, b) => a.score - b.score);
    });
    setSubmitted(true);
  };

  const handleChallenge = (challengeId, action) => {
    setChallenges((prev) => {
      const next = { ...prev };
      if (action === "accept")   next[challengeId] = "accepted";
      if (action === "complete") {
        next[challengeId] = "completed";
        const ch = CHALLENGES.find((c) => c.id === challengeId);
        if (ch && myEntry) {
          const updatedEntry = {
            ...myEntry,
            points: (myEntry.points || 0) + ch.reward,
            completed: [...(myEntry.completed || []), challengeId],
          };
          setMyEntry(updatedEntry);
          localStorage.setItem("eco_my_entry", JSON.stringify(updatedEntry));
          setEntries((prev2) =>
            prev2.map((en) =>
              en.name === myEntry.name ? { ...en, points: updatedEntry.points, completed: updatedEntry.completed } : en
            ).sort((a, b) => a.score - b.score)
          );
        }
      }
      if (action === "abandon")  delete next[challengeId];
      return next;
    });
  };

  const sorted = [...entries].sort((a, b) => a.score - b.score);
  const topThree = sorted.slice(0, 3);

  const filteredChallenges = filterDiff === "All"
    ? CHALLENGES
    : CHALLENGES.filter((c) => c.difficulty === filterDiff);

  return (
    <section id="leaderboard" className="px-10 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="bg-purple-900/50 text-purple-300 px-4 py-1 rounded-full text-sm font-medium">
          🏆 Community Challenge
        </span>
        <h2 className="text-3xl font-bold mt-4">
          Leaderboard & <span className="text-orange-400">Challenges</span>
        </h2>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">
          Submit your carbon footprint, climb the rankings, and complete
          real-world eco challenges to earn points and badges.
        </p>
      </div>

      {/* Podium — top 3 */}
      <div className="flex justify-center items-end gap-4 mb-10">
        {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
          if (!entry) return null;
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
              <p className="font-bold text-sm text-center">{entry.name}</p>
              <p className="text-orange-400 font-bold text-sm">{entry.score}t CO₂</p>
              <div
                className={`w-full rounded-t-xl ${
                  i === 1 ? "bg-yellow-500/30 border border-yellow-500/50" :
                  i === 0 ? "bg-gray-400/20 border border-gray-400/40" :
                            "bg-orange-700/20 border border-orange-700/40"
                } ${heights[i]} flex items-end justify-center pb-2`}
              >
                <span className="text-gray-400 text-xs font-bold">#{ranks[i]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["leaderboard", "challenges", "submit"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-orange-500 text-white"
                : "bg-slate-900 text-gray-400 hover:text-gray-200 border border-slate-700"
            }`}
          >
            {tab === "leaderboard" ? "🏅 Rankings" : tab === "challenges" ? "🎯 Challenges" : "📤 Submit Score"}
          </button>
        ))}
      </div>

      {/* ── LEADERBOARD TAB ── */}
      {activeTab === "leaderboard" && (
        <div className="bg-slate-900 rounded-2xl border border-orange-500/20 overflow-hidden">
          <table className="w-full text-sm" aria-label="Carbon footprint leaderboard">
            <caption className="sr-only">Users ranked by lowest carbon footprint</caption>
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th scope="col" className="px-6 py-3 text-left text-gray-400 font-medium">Rank</th>
                <th scope="col" className="px-4 py-3 text-left text-gray-400 font-medium">Player</th>
                <th scope="col" className="px-4 py-3 text-left text-gray-400 font-medium">Badge</th>
                <th scope="col" className="px-4 py-3 text-right text-gray-400 font-medium">CO₂ (t/yr)</th>
                <th scope="col" className="px-4 py-3 text-right text-gray-400 font-medium">Challenges</th>
                <th scope="col" className="px-6 py-3 text-right text-gray-400 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry, i) => {
                const badge   = getBadge(entry.score);
                const isMe    = entry.isMe;
                const medal   = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                return (
                  <tr
                    key={entry.name}
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
        </div>
      )}

      {/* ── CHALLENGES TAB ── */}
      {activeTab === "challenges" && (
        <div>
          {!myEntry && (
            <div className="bg-orange-900/20 border border-orange-700/30 rounded-xl px-5 py-3 mb-6 text-sm text-orange-300 flex items-center gap-3">
              <span>⚠️</span>
              <span>Submit your score first to earn points from completed challenges.</span>
            </div>
          )}

          {/* Difficulty filter */}
          <div className="flex gap-2 mb-5">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                aria-pressed={filterDiff === d}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filterDiff === d
                    ? "border-orange-500 bg-orange-500/20 text-orange-300"
                    : "border-slate-700 text-gray-400 hover:border-orange-500/40"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredChallenges.map((ch) => {
              const state = challenges[ch.id];
              return (
                <div
                  key={ch.id}
                  className={`bg-slate-900 rounded-2xl border p-5 transition-colors ${
                    state === "completed"
                      ? "border-green-600/40 bg-green-900/10"
                      : state === "accepted"
                      ? "border-orange-500/40"
                      : "border-slate-700/50 hover:border-orange-500/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{ch.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-100">{ch.title}</h3>
                        <p className="text-gray-400 text-sm mt-0.5">{ch.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[ch.difficulty]}`}>
                            {ch.difficulty}
                          </span>
                          <span className="text-purple-400 text-xs font-semibold">+{ch.reward} pts</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!state && (
                        <button
                          onClick={() => handleChallenge(ch.id, "accept")}
                          className="bg-orange-500 hover:bg-orange-600 transition-colors text-white text-xs font-semibold px-4 py-1.5 rounded-lg"
                        >
                          Accept
                        </button>
                      )}
                      {state === "accepted" && (
                        <>
                          <button
                            onClick={() => handleChallenge(ch.id, "complete")}
                            className="bg-green-600 hover:bg-green-700 transition-colors text-white text-xs font-semibold px-4 py-1.5 rounded-lg"
                          >
                            ✓ Done!
                          </button>
                          <button
                            onClick={() => handleChallenge(ch.id, "abandon")}
                            className="text-gray-500 hover:text-gray-300 text-xs px-4 py-1 rounded-lg border border-slate-700"
                          >
                            Abandon
                          </button>
                        </>
                      )}
                      {state === "completed" && (
                        <span className="text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-900/30 border border-green-700/30">
                          ✅ Completed
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

      {/* ── SUBMIT SCORE TAB ── */}
      {activeTab === "submit" && (
        <div className="max-w-md mx-auto">
          {submitted ? (
            <div className="bg-green-900/20 border border-green-600/40 rounded-2xl p-8 text-center">
              <span className="text-5xl">🎉</span>
              <h3 className="text-xl font-bold mt-4">Score Submitted!</h3>
              <p className="text-gray-400 mt-2">
                Welcome to the leaderboard, <span className="text-orange-400 font-semibold">{myEntry?.name}</span>!
              </p>
              <div className="mt-4 bg-slate-900 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Your footprint</p>
                <p className="text-4xl font-bold text-orange-400 mt-1">{myEntry?.score}t <span className="text-lg">CO₂/yr</span></p>
                <p className={`text-sm font-semibold mt-2 ${getBadge(myEntry?.score).color}`}>
                  {getBadge(myEntry?.score).label}
                </p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setActiveTab("challenges"); }}
                className="mt-5 bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                🎯 Take on Challenges →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-orange-500/20 p-8 space-y-5">
              <h3 className="text-xl font-bold">Join the Leaderboard</h3>
              <p className="text-gray-400 text-sm">
                Enter your name and carbon footprint from the calculator above to claim your rank.
              </p>

              <div>
                <label htmlFor="lb_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your name / username
                </label>
                <input
                  id="lb_name"
                  type="text"
                  required
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="e.g. Priya S."
                  className="w-full bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="lb_score" className="block text-sm font-medium text-gray-300 mb-2">
                  Your carbon footprint (tonnes CO₂/yr)
                </label>
                <input
                  id="lb_score"
                  type="number"
                  required
                  step="0.1"
                  min="0.1"
                  max="200"
                  value={myScore}
                  onChange={(e) => setMyScore(e.target.value)}
                  placeholder="e.g. 8.4"
                  className="w-full bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                />
                {currentFootprint && (
                  <p className="text-xs text-orange-400 mt-1.5 flex items-center gap-1">
                    <span>💡</span> Auto-filled from your calculator ({currentFootprint}t)
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 transition-colors py-3 rounded-xl font-semibold"
              >
                🏆 Submit & Join Leaderboard
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
