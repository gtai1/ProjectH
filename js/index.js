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
        points: 0,
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
            points: 0,
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

      // 3. Assists
      if (b.assists !== a.assists) {
        return b.assists - a.assists;
      }
    });

    //calculate player streaks
    const playerStreaks = await calculatePlayerStreaks();

    // Create a row for every player
    sortedPlayers.forEach((player) => {
      const row = document.createElement("tr");

      const currentPlayerStreak = playerStreaks.find(playerStreak => playerStreak.name === player.name);

      if (currentPlayerStreak.currentGoalStreak >= 3) {
        row.innerHTML = `
                    <td><strong>${player.name}</strong><img src="./icons/fire.png" alt="fire" width="15" height="15" /></td>
                `;
      } else if (currentPlayerStreak.currentUnluckyStreak >= 3) {
        row.innerHTML = `
                    <td><strong>${player.name}</strong><img src="./icons/ice-cube.png" alt="fire" width="15" height="15" /></td>
                `;
      } else {
        row.innerHTML = `
                    <td><strong>${player.name}</strong></td>
                `;
      }

      row.innerHTML += `
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

    newsContainer.innerHTML = "";

    // Sort newest to oldest and take the latest 3 games
    const recentGames = [...games]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    recentGames.forEach((game) => {
      const gameDate = new Date(game.date + "T00:00:00");

      const formattedDate = gameDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      // Get players with goals or assists
      const scorers = game.players
        .filter((player) => player.goals > 0 || player.assists > 0)
        .sort(
          (a, b) =>
            b.goals - a.goals || b.assists - a.assists
        );

      const formatPlayer = (player) =>
        `${player.name} ${player.goals}G ${player.assists}A ${
          player.goals + player.assists
        }P`;

      const whiteScorers = scorers
        .filter((player) => player.team[0].toUpperCase() === "W")
        .map(formatPlayer)
        .join(", ");

      const blackScorers = scorers
        .filter((player) => player.team[0].toUpperCase() === "B")
        .map(formatPlayer)
        .join(", ");

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

          <div class="home-score">

            <div class="home-score-row">
              <div class="home-team-info">
                <img src="./icons/white-jersey.svg"
                     alt="White jersey" width="25" height="25">
                <span class="home-team-name">White</span>
              </div>
              <span class="home-team-score">${game.whiteAwayScore}</span>
            </div>

            <div class="home-score-row">
              <div class="home-team-info">
                <img src="./icons/black-jersey.svg"
                     alt="Black jersey" width="25" height="25">
                <span class="home-team-name">Black</span>
              </div>
              <span class="home-team-score">${game.blackHomeScore}</span>
            </div>

          </div>

          ${playerGoals ? `
            <p>
              ${playerGoals}
            </p>
          ` : ""}

        </div>
      `;

      newsContainer.appendChild(newsCard);
    });
  } catch (error) {
    console.error("Error loading game news:", error);
  }
}

async function calculatePlayerStreaks() {
  // Fetch both JSON files
  const [playersResponse, gamesResponse] = await Promise.all([
    fetch("./data/players.json"),
    fetch("./data/games.json"),
  ]);

  // Convert responses into JavaScript arrays
  const [players, games] = await Promise.all([
    playersResponse.json(),
    gamesResponse.json(),
  ]);

  // Create an entry for every player
  const playerStats = players.map((player) => ({
    name: player.name,
    goals: 0,
    gamesPlayed: 0,
    currentGoalStreak: 0,
    currentUnluckyStreak: 0,
    streak: null,
  }));

  // Process games chronologically (newest to oldest)
  const sortedGames = [...games].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  // Process each game
  for (const game of sortedGames) {
    for (const player of playerStats) {
      const gameStats = game.players.find((p) => p.name === player.name);

      if (gameStats == undefined) {
        continue;
      }

      const goals = gameStats?.goals ?? 0;

      player.gamesPlayed++;
      player.goals += goals;

      if (goals > 0) {
        player.currentGoalStreak++;
        player.currentUnluckyStreak = 0;
      } else {
        player.currentUnluckyStreak++;
        player.currentGoalStreak = 0;
      }
    }
  }

  // Determine each player's current streak
  for (const player of playerStats) {
    if (player.currentGoalStreak >= 3) {
      player.streak = {
        type: "goal",
        games: player.currentGoalStreak,
      };
    } else if (player.currentUnluckyStreak >= 3) {
      player.streak = {
        type: "unlucky",
        games: player.currentUnluckyStreak,
      };
    }
  }

  return playerStats;
}
