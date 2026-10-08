export async function loadScores() {
  try {
    const response = await fetch("../data/games.json");
    const games = await response.json();

    const scoresData = document.getElementById("scores-data");

    // Clear existing cards
    scoresData.innerHTML = "";

    // Create a card for each game
    games.forEach((game) => {
      const scoreCard = document.createElement("div");
      scoreCard.classList.add("score-card");

      // Calculate total points for each player
      const playersHTML = game.players
        .map((player) => {
          const points = player.goals + player.assists;

          return `
            <div class="player-row">
              <span class="player-name">${player.name}</span>
              <span>${player.goals} G</span>
              <span>${player.assists} A</span>
              <span>${points} PTS</span>
            </div>
          `;
        })
        .join("");

      scoreCard.innerHTML = `
        <div class="game-header">
          <div class="game-date">${game.date}</div>

          <div class="score">
            <div class="team">
              <span class="team-name">Black</span>
              <span class="team-score">${game.blackHomeScore}</span>
            </div>

            <span class="vs">-</span>

            <div class="team">
              <span class="team-name">White</span>
              <span class="team-score">${game.whiteAwayScore}</span>
            </div>
          </div>

          <button class="dropdown-button" type="button">
            Players
            <span class="arrow">▼</span>
          </button>
        </div>

        <div class="players-dropdown">
          ${playersHTML}
        </div>
      `;

      // Add click handler for dropdown
      const dropdownButton = scoreCard.querySelector(".dropdown-button");
      const playersDropdown = scoreCard.querySelector(".players-dropdown");
      const arrow = scoreCard.querySelector(".arrow");

      dropdownButton.addEventListener("click", () => {
        const isOpen = playersDropdown.classList.toggle("open");

        arrow.textContent = isOpen ? "▲" : "▼";
      });

      // Add card to page
      scoresData.appendChild(scoreCard);
    });
  } catch (error) {
    console.error("Error loading scores:", error);
  }
}
