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
        postGoals: 0,
        totalIncludingPosts: 0,
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
            postGoals: 0,
            totalIncludingPosts: 0,
          };
        }

        playerStats[player.name].gamesPlayed++;

        playerStats[player.name].goals += player.goals || 0;

        playerStats[player.name].postGoals += player.postGoals || 0;

        playerStats[player.name].totalIncludingPosts =
          playerStats[player.name].goals + playerStats[player.name].postGoals;
      });
    });

    const tableBody = document.getElementById("player-stats-body");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Convert stats object to an array and sort
    const sortedPlayers = Object.values(playerStats).sort((a, b) => {
      // 1. Total including posts
      if (b.totalIncludingPosts !== a.totalIncludingPosts) {
        return b.totalIncludingPosts - a.totalIncludingPosts;
      }

      // 2. Regular goals
      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }

      // 3. Post goals
      return b.postGoals - a.postGoals;
    });

    // Create a row for every player
    sortedPlayers.forEach((player) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                    <td><strong>${player.name}</strong></td>
                    <td>${player.gamesPlayed}</td>
                    <td>${player.totalIncludingPosts}</td>
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

      const playerGoals = game.players
        .filter((player) => player.goals > 0 || player.postGoals > 0)
        .map((player) => {
          let text = `${player.name}(${player.team[0].toUpperCase()}) ${player.goals} G`;

          if (player.goals !== 1) {
            text += "s";
          }

          if (player.postGoals > 0) {
            text += ` (${player.postGoals} post goal`;

            if (player.postGoals !== 1) {
              text += "s";
            }

            text += ")";
          }

          return text;
        })
        .join(", ");

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
