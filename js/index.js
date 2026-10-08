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
