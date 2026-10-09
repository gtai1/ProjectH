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

      const goals = game.players
        .filter((player) => player.goals > 0)
        .map(
          (player) =>
            `${player.name} ${player.goals}`,
        )
        .join(", ");

      const assists = game.players
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
              <img src="../icons/white-jersey.svg" alt="WhiteJersey" width="25" hieght="25" />
              <span class="team-score">${game.whiteAwayScore}</span>
            </div>

            <span class="vs">@</span>
            
            <div class="team-home">
              <span class="team-score">${game.blackHomeScore}</span>
              <img src="../icons/black-jersey.svg" alt="BlackJersey" width="25" hieght="25" />
              <span class="team-name">Black</span>
            </div>

          </div>

          ${playerScores ? `<div class="goal-scorers">${playerScores}</div>` : ""}

          ${game.note ? `<div class="game-note">${game.note}</div>` : ""}
        </div>
      `;

      scoresData.appendChild(scoreCard);
    });
  } catch (error) {
    console.error("Error loading scores:", error);
  }
}
