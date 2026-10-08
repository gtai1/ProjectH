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

      const playersHTML = [...game.players]
        .map((player) => ({
          ...player,
          points: player.goals + player.assists,
        }))
        .sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }

          return b.goals - a.goals;
        })
        .map((player) => {
          const points = player.points;

          return `
            <div class="player-row">
              <span class="player-name">${player.name}(${player.team[0].toUpperCase()})</span>
              <span>${player.goals} G</span>
              <span>${player.assists} A</span>
              <span>${points} P</span>
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

          ${game.note ? `<div class="game-note">${game.note}</div>` : ""}

          <div class="dropdown-arrow">▼</div>
        </div>

        <div class="players-dropdown">
          ${playersHTML}
        </div>
      `;

      // Open/close dropdown when the card is clicked
      scoreCard.addEventListener("click", () => {
        const playersDropdown = scoreCard.querySelector(".players-dropdown");

        const arrow = scoreCard.querySelector(".dropdown-arrow");

        const isOpen = playersDropdown.classList.toggle("open");

        arrow.textContent = isOpen ? "▲" : "▼";
      });

      scoresData.appendChild(scoreCard);
    });
  } catch (error) {
    console.error("Error loading scores:", error);
  }
}
