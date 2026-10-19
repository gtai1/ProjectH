export async function loadGoals(id) {
  try {
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch(id == "stats-body" ? "../data/players.json" : "../data/playersLegacy.json"),
      fetch(id == "stats-body-legacy-2026" ? "../data/gamesLegacy2026.json" : id == "stats-body-legacy-2025" ? "../data/gamesLegacy2025.json" : "../data/games.json"),
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

    // Get the table headers
    const table = statsBody.closest("table");
    const headers = table.querySelectorAll("th[data-sort]");

    let sortColumn = id === "stats-body" ? "points" : "goals";
    let sortDirection = "desc";

    // Render the table
    function renderStats() {
      const sortedPlayers = Object.values(playerStats).sort((a, b) => {
        const direction = sortDirection === "desc" ? -1 : 1;
      
        // Primary sort: selected column
        const valueA = a[sortColumn] ?? 0;
        const valueB = b[sortColumn] ?? 0;
      
        let result;
      
        if (typeof valueA === "string") {
          result = valueA.localeCompare(valueB);
        } else {
          result = valueA - valueB;
        }
      
        if (result !== 0) {
          return result * direction;
        }
      
        // Tie-breakers: Points, Goals, Assists, GP, Name
        if (a.points !== b.points) {
          return (a.points - b.points) * direction;
        }
      
        if (a.goals !== b.goals) {
          return (a.goals - b.goals) * direction;
        }
      
        if (a.assists !== b.assists) {
          return (a.assists - b.assists) * direction;
        }
      
        if (a.gamesPlayed !== b.gamesPlayed) {
          return (a.gamesPlayed - b.gamesPlayed) * direction;
        }
      
        return b.name.localeCompare(a.name) * direction;
      });

      statsBody.innerHTML = "";

      sortedPlayers.forEach((player) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td><strong>${player.name}</strong></td>
          <td>${player.gamesPlayed}</td>
          <td>${player.goals}</td>
        `;

        if (id === "stats-body") {
          row.innerHTML += `
            <td>${player.assists}</td>
            <td>${player.points}</td>
          `;
        }

        row.innerHTML += `
          <td>${player.wins}</td>
          <td>${player.losses}</td>
          <td>${player.ties}</td>
          <td>${player.goalsFor}</td>
          <td>${player.goalsAgainst}</td>
          <td>${player.plusMinus > 0 ? "+" : ""}${player.plusMinus}</td>
        `;

        statsBody.appendChild(row);
      });

      // Update the active column's arrow
      headers.forEach((header) => {
        const active = header.dataset.sort === sortColumn;

        header.classList.toggle("sort-active", active);
        header.setAttribute(
          "aria-sort",
          active
            ? sortDirection === "asc" ? "ascending" : "descending"
            : "none"
        );
      });
    }

    // Add click events to the headers
    headers.forEach((header) => {
      if (header.dataset.sortableBound === "true") return;
      header.dataset.sortableBound = "true";

      const sort = () => {
        const column = header.dataset.sort;

        if (sortColumn === column) {
          sortDirection = sortDirection === "desc" ? "asc" : "desc";
        } else {
          sortColumn = column;
          sortDirection = column === "name" ? "asc" : "desc";
        }

        renderStats();
      };

      header.addEventListener("click", sort);
    });

    // Initial table display
    renderStats();

  } catch (error) {
    console.error("Error loading player stats:", error);
  }
}
