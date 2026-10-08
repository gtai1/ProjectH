import { loadPlayerStats } from "./index.js";
import { loadPlayers } from "./players.js";
import { loadGoals } from "./stats.js";

if (document.getElementById("players-grid")) {
    loadPlayers();
}

if (document.getElementById("player-stats-body")) {
    loadPlayerStats();
}

if (document.getElementById("stats-body")) {
    loadGoals();
}
