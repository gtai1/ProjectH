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

      const goals = [...game.players]
        .sort((a, b) => b.goals - a.goals)
        .filter((player) => player.goals > 0)
        .map(
          (player) =>
            `${player.name} ${player.goals}`,
        )
        .join(", ");
      
      const assists = [...game.players]
        .sort((a, b) => b.assists - a.assists)
        .filter((player) => player.assists > 0)
        .map(
          (player) =>
            `${player.name} ${player.assists}`,
        )
        .join(", ");

      const playerScores = `
        ${goals ? `
          <div>
            <span><b>Goals</b>: ${goals}</span>
          </div>
        ` : ""}

        ${assists ? `
          <div>
            <span><b>Assists</b>: ${assists}</span>
          </div>
        ` : ""}
      `;

      scoreCard.innerHTML = `
        <div class="game-header">
          <div class="game-date">${game.date}</div>

          <div class="score">
            <div class="team-away">
              <span class="team-name">White</span>
              <img src="../icons/white-jersey.svg" alt="WhiteJersey" width="25" height="25" />
              <span class="team-score">${game.whiteAwayScore}</span>
            </div>

            <span class="vs">@</span>
            
            <div class="team-home">
              <span class="team-score">${game.blackHomeScore}</span>
              <img src="../icons/black-jersey.svg" alt="BlackJersey" width="25" height="25" />
              <span class="team-name">Black</span>
            </div>

          </div>

          ${goals || assists ? `<div class="goal-scorers score-details">${playerScores}</div>` : ""}

          ${game.note ? `<div class="game-note">${game.note}</div>` : ""}
        </div>
      `;

      scoreCard.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 768px)").matches) {
          scoreCard.classList.toggle("expanded");
        }
      });
      
      scoresData.prepend(scoreCard);
    });
  } catch (error) {
    console.error("Error loading scores:", error);
  }
}
