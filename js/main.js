import { loadPlayerStats, loadGameNews } from "./index.js";
import { loadPlayers } from "./players.js";
import { loadGoals } from "./stats.js";
import { loadScores } from "./scores.js";

// index.html
if (document.getElementById("news-container")) {
    loadGameNews();
}

if (document.getElementById("player-stats-body")) {
    loadPlayerStats();
}

// players/index.html
if (document.getElementById("players-grid")) {
    loadPlayers();
}

// stats/index.html
if (document.getElementById("stats-body")) {
    loadGoals("stats-body");
}

// legacy/index.html
if (document.getElementById("stats-body-legacy-2026")) {
    loadGoals("stats-body-legacy-2026");
}

// legacy/index.html
if (document.getElementById("stats-body-legacy-2025")) {
    loadGoals("stats-body-legacy-2025");
}

// scores/index.html
if (document.getElementById("scores-data")) {
    loadScores();
}
