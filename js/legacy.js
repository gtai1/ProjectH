export async function loadGoals() {
  try {
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch("../data/players.json"),
      fetch("../data/games.json"),
    ]);

    if (!playersResponse.ok || !gamesResponse.ok) {
      throw new Error("Unable to load player or game data");
    }

    const players = await playersResponse.json();
    const games = await gamesResponse.json();

    const playerStats = {};

    // Initialize every player from players.json
    players.forEach((player) => {
      playerStats[player.name] = {
        name: player.name,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        plusMinus: 0,
        goals: 0,
        postGoals: 0,
        totalGoals: 0,
      };
    });

    // Process every game
    games.forEach((game) => {
      game.players.forEach((player) => {
        const stats = playerStats[player.name];

        // Ignore players that aren't in players.json
        if (!stats) {
          return;
        }

        // Games played
        stats.gamesPlayed++;

        let goalsFor;
        let goalsAgainst;

        // Determine player's team's score
        if (player.team === "black") {
          goalsFor = game.blackHomeScore;
          goalsAgainst = game.whiteAwayScore;
        } else {
          goalsFor = game.whiteAwayScore;
          goalsAgainst = game.blackHomeScore;
        }

        // Goals for and against
        stats.goalsFor += goalsFor;
        stats.goalsAgainst += goalsAgainst;

        // Plus / minus
        stats.plusMinus += goalsFor - goalsAgainst;

        // Wins, losses, ties
        if (goalsFor > goalsAgainst) {
          stats.wins++;
        } else if (goalsFor < goalsAgainst) {
          stats.losses++;
        } else {
          stats.ties++;
        }

        // Individual goals
        stats.goals += player.goals || 0;
        stats.postGoals += player.postGoals || 0;

        // Total goals including post goals
        stats.totalGoals = stats.goals + stats.postGoals;
      });
    });

    const statsBody = document.getElementById("stats-body-legacy");

    // Clear existing rows
    statsBody.innerHTML = "";

    // Sort:
    // 1. Total goals
    // 2. Regular goals
    // 3. Post goals
    const sortedPlayers = Object.values(playerStats).sort((a, b) => {
      if (b.totalGoals !== a.totalGoals) {
        return b.totalGoals - a.totalGoals;
      }

      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }

      return b.postGoals - a.postGoals;
    });

    // Create a row for every player
    sortedPlayers.forEach((player) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td><strong>${player.name}</strong></td>
        <td>${player.gamesPlayed}</td>
        <td>${player.wins}</td>
        <td>${player.losses}</td>
        <td>${player.ties}</td>
        <td>${player.goalsFor}</td>
        <td>${player.goalsAgainst}</td>
        <td>${player.plusMinus > 0 ? "+" : ""}${player.plusMinus}</td>
        <td>${player.totalGoals} (${player.postGoals} Post Goals)</td>
      `;

      statsBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading player stats:", error);
  }
}
