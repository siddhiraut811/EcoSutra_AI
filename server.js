import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = 3001;
const DB   = path.join(__dirname, "leaderboard.json");

app.use(cors());
app.use(express.json());

// ── Challenge catalog (server-authoritative) ─────────────
const CHALLENGE_CATALOG = {
  no_meat_week:   120,
  cycle_to_work:  180,
  solar_pledge:   300,
  plant_10_trees: 500,
  zero_flight:    600,
  vegan_month:    700,
  carpool_week:   200,
  energy_fast:    150,
};

// ── helpers ──────────────────────────────────────────────
const SEED = [
  { name: "Priya S.",  score: 3.2,  points: 1200, completed: ["no_meat_week","cycle_to_work","vegan_month"] },
  { name: "Liam K.",   score: 4.8,  points: 980,  completed: ["cycle_to_work","plant_10_trees"]             },
  { name: "Mei L.",    score: 6.1,  points: 870,  completed: ["no_meat_week","solar_pledge"]                },
  { name: "Arjun R.",  score: 7.5,  points: 720,  completed: ["carpool_week","energy_fast"]                 },
  { name: "Sofia V.",  score: 9.2,  points: 650,  completed: ["no_meat_week"]                               },
  { name: "Omar H.",   score: 11.4, points: 510,  completed: ["carpool_week"]                               },
  { name: "Yuki T.",   score: 13.0, points: 420,  completed: []                                             },
];

function readDB() {
  try {
    if (fs.existsSync(DB)) return JSON.parse(fs.readFileSync(DB, "utf8"));
  } catch {}
  return [...SEED];
}

function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// ── routes ────────────────────────────────────────────────
// GET leaderboard
app.get("/api/leaderboard", (_req, res) => {
  res.json(readDB().sort((a, b) => a.score - b.score));
});

// POST submit / update score
app.post("/api/leaderboard", (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number" || score <= 0)
    return res.status(400).json({ error: "Invalid name or score" });

  const entries = readDB();
  const existing = entries.find((e) => e.name === name);
  const basePoints = Math.round(Math.max(0, (30 - score)) * 20);

  if (existing) {
    // Update score; keep accumulated challenge points; only refresh base once
    existing.score  = Math.round(score * 10) / 10;
    // recalculate base but don't inflate — keep challenge bonus
    const bonus = existing.points - (existing.basePoints ?? 0);
    existing.basePoints = basePoints;
    existing.points = basePoints + Math.max(0, bonus);
  } else {
    entries.push({ name, score: Math.round(score * 10) / 10, basePoints, points: basePoints, completed: [] });
  }

  writeDB(entries);
  res.json(entries.sort((a, b) => a.score - b.score));
});

// POST complete challenge → earn points (reward is server-authoritative)
app.post("/api/leaderboard/challenge", (req, res) => {
  const { name, challengeId } = req.body;
  if (!name || !challengeId) return res.status(400).json({ error: "Missing fields" });

  const reward = CHALLENGE_CATALOG[challengeId];
  if (reward === undefined) return res.status(400).json({ error: "Unknown challenge" });

  const entries = readDB();
  const entry   = entries.find((e) => e.name === name);
  if (!entry) return res.status(404).json({ error: "User not found" });

  // Idempotent: only award once per challenge
  if (!entry.completed.includes(challengeId)) {
    entry.completed.push(challengeId);
    entry.points = (entry.points || 0) + reward;
  }

  writeDB(entries);
  res.json(entries.sort((a, b) => a.score - b.score));
});

app.listen(PORT, () => console.log(`🌿 EcoSutra API running on port ${PORT}`));
