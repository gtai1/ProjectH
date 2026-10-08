import { loadPlayerStats, loadGameNews } from "./index.js";
import { loadPlayers } from "./players.js";
import { loadGoals } from "./stats.js";

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
    loadGoals();
}

// legacy/index.html
if (document.getElementById("stats-body-legacy")) {
    loadGoals();
}
