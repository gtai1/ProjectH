export function tallyPlayerGoals(games) {
  return games.reduce((totals, game) => {
    game.players.forEach((player) => {
      if (!totals[player.name]) {
        totals[player.name] = {
          goals: 0,
          postGoals: 0,
          totalGoals: 0,
        };
      }

      totals[player.name].goals += player.goals;
      totals[player.name].postGoals += player.postGoals;
      totals[player.name].totalGoals =
        totals[player.name].goals + totals[player.name].postGoals;
    });

    return totals;
  }, {});
}

export async function loadPlayerStats() {
  try {
    // Load both JSON files
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch("players.json"),
      fetch("games.json"),
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

export async function loadPlayers() {
  try {
    // Load both JSON files
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch("players.json"),
      fetch("games.json"),
    ]);

    const players = await playersResponse.json();
    const games = await gamesResponse.json();

    const playersGrid = document.getElementById("players-grid");

    // Clear existing generated cards
    playersGrid.innerHTML = "";

    // Create a card for each player
    players.forEach((player) => {
      // Find all games this player appeared in
      const playerGames = games.filter((game) =>
        game.players.some((gamePlayer) => gamePlayer.name === player.name),
      );

      // Total games played
      const gamesPlayed = playerGames.length;

      // Total goals
      const goals = playerGames.reduce((total, game) => {
        const gamePlayer = game.players.find((p) => p.name === player.name);

        return total + (gamePlayer ? gamePlayer.goals : 0);
      }, 0);

      const postGoals = playerGames.reduce((total, game) => {
        const gamePlayer = game.players.find((p) => p.name === player.name);

        return total + (gamePlayer ? gamePlayer.postGoals : 0);
      }, 0);

      const goalsIncludingPosts = goals + postGoals;

      // Create player card
      const playerCard = document.createElement("article");
      playerCard.classList.add("player-card");

      playerCard.innerHTML = `
                  <div class="player-image">
                      <img src="${player.image}" alt="${player.name} #${player.number}">
                  </div>
  
                  <div class="player-info">
  
                      <h4>${player.name} #${player.number}</h4>
  
                      <div class="player-position">
                          ${player.position}
                      </div>
  
                      <div class="player-stats">
  
                          <div class="stat">
                              <strong>${gamesPlayed}</strong>
                              <span>GP</span>
                          </div>
  
                          <!--
                          <div class="stat">
                              <strong>${goals}</strong>
                              <span>G</span>
                          </div>
                          -->

                          <div class="stat">
                              <strong>${goalsIncludingPosts}</strong>
                              <span>G</span>
                          </div>
  
                      </div>
  
                  </div>
              `;

      // Add card to the page
      playersGrid.appendChild(playerCard);
    });
  } catch (error) {
    console.error("Error loading players:", error);
  }
}

export async function loadGoals() {
  try {
    const response = await fetch("./games.json");

    if (!response.ok) {
      throw new Error("Unable to load data.json");
    }

    const games = await response.json();
    const playerGoals = tallyPlayerGoals(games);
    console.log(playerGoals);
    const statsBody = document.getElementById("stats-body");

    Object.entries(playerGoals).forEach(([name, stats]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${name}</td>
                <td>${stats.goals}</td>
                <td>${stats.postGoals}</td>
                <td><strong>${stats.totalGoals}</strong></td>
            `;
      statsBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading player stats:", error);
  }
}
