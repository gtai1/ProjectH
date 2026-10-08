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
