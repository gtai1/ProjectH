export async function loadGoals(id) {
  try {
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch(id == "stats-body" ? "../data/players.json" : "../data/playersLegacy.json"),
      fetch(id == "stats-body" ? "../data/games.json" :"../data/gamesLegacy2026.json"),
      fetch(id == "stats-body" ? "../data/games.json" :"../data/gamesLegacy2025.json"),
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
        assists: 0,
        points: 0,
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

        // Assists
        stats.assists += player.assists || 0;

        // Points
        stats.points += player.goals + player.assists;
      });
    });

    const statsBody = document.getElementById(id);

    // Clear existing rows
    statsBody.innerHTML = "";

    // Sort:
    // 1. Total goals
    // 2. Regular goals
    // 3. Post goals
    const sortedPlayers = Object.values(playerStats).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }
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
        <td>${player.goals}</td>
      `;

      if (id == "stats-body") {
        row.innerHTML += `
          <td>${player.assists}</td>
          <td>${player.points}</td>
        `;
      }

      statsBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading player stats:", error);
  }
}
