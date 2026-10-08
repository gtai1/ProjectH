export async function loadPlayerStats() {
  try {
    // Load both JSON files
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch("./data/players.json"),
      fetch("./data/games.json"),
    ]);

    const players = await playersResponse.json();
    const games = await gamesResponse.json();

    const playerStats = {};

    // Initialize every player from players.json
    players.forEach((player) => {
      playerStats[player.name] = {
        name: player.name,
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        points: 0
      };
    });

    // Add statistics from games.json
    games.forEach((game) => {
      game.players.forEach((player) => {
        // Make sure the player exists
        if (!playerStats[player.name]) {
          playerStats[player.name] = {
            name: player.name,
            gamesPlayed: 0,
            goals: 0,
            assists: 0,
            points: 0
          };
        }

        playerStats[player.name].gamesPlayed++;

        playerStats[player.name].goals += player.goals || 0;

        playerStats[player.name].assists += player.assists || 0;

        playerStats[player.name].points =
          playerStats[player.name].goals + playerStats[player.name].assists;
      });
    });

    const tableBody = document.getElementById("player-stats-body");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Convert stats object to an array and sort
    const sortedPlayers = Object.values(playerStats).sort((a, b) => {
      // 1. Total points
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      // 2. Regular goals
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
                    <td>${player.goals}</td>
                    <td>${player.assists}</td>
                    <td>${player.points}</td>
                `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading player stats:", error);
  }
}

export async function loadGameNews() {
  try {
    const response = await fetch("./data/games.json");

    if (!response.ok) {
      throw new Error("Unable to load games.json");
    }

    const games = await response.json();

    const newsContainer = document.getElementById("news-container");

    // Clear existing cards
    newsContainer.innerHTML = "";

    // Sort games from newest to oldest
    // and take only the most recent 2
    const recentGames = games
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);

    // Create a news card for each recent game
    recentGames.forEach((game) => {
      // Format ISO date for display
      const gameDate = new Date(game.date + "T00:00:00");

      const formattedDate = gameDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const score = `Black ${game.blackHomeScore} White ${game.whiteAwayScore}`;

      // Get players who scored regular goals or post goals
      const scorers = game.players.filter(
        (player) => player.goals > 0,
      );

      // Format a player
      const formatPlayer = (player) => {
        let text = `${player.name} ${player.goals}G ${player.assists}A ${player.goals + player.assists}P`;

        return text;
      };

      // Get Black scorers
      const blackScorers = scorers
        .filter((player) => player.team[0].toUpperCase() === "B")
        .map(formatPlayer)
        .join(", ");

      // Get Whitie scorers
      const whiteScorers = scorers
        .filter((player) => player.team[0].toUpperCase() === "W")
        .map(formatPlayer)
        .join(", ");

      // Build player goals text
      const playerGoals = [
        blackScorers ? `Black: ${blackScorers}` : "",
        whiteScorers ? `White: ${whiteScorers}` : "",
      ]
        .filter(Boolean)
        .join("<br>");

      const newsCard = document.createElement("article");
      newsCard.classList.add("news-card");

      newsCard.innerHTML = `
        <div class="news-content">

          <div class="news-date">
            ${formattedDate}
          </div>

          <h4>
            ${score}
          </h4>

          <p>
            ${playerGoals}
          </p>

        </div>
      `;

      newsContainer.appendChild(newsCard);
    });
  } catch (error) {
    console.error("Error loading game news:", error);
  }
}

