export async function loadScores() {
  try {
    const response = await fetch("../data/games.json");

    if (!response.ok) {
      throw new Error("Unable to load games.json");
    }

    const games = await response.json();
    const scoresData = document.getElementById("scores-data");

    scoresData.innerHTML = "";

    games.forEach((game) => {
      const scoreCard = document.createElement("div");
      scoreCard.classList.add("score-card");

      // Sort players by goals, then assists
      const scorers = game.players
        .filter((player) => player.goals > 0 || player.assists > 0)
        .sort(
          (a, b) =>
            b.goals - a.goals || b.assists - a.assists
        );

      // Format each player's statistics
      const formatPlayer = (player) => `
        <span class="score-player-stat">
          <strong>${player.name}</strong>
          <span>${player.goals}G · ${player.assists}A · ${
            player.goals + player.assists
          }P</span>
        </span>
      `;

      // Separate players by team
      const whiteScorers = scorers
        .filter((player) => player.team?.[0]?.toUpperCase() === "W")
        .map(formatPlayer)
        .join("");

      const blackScorers = scorers
        .filter((player) => player.team?.[0]?.toUpperCase() === "B")
        .map(formatPlayer)
        .join("");

      const playerStats = whiteScorers || blackScorers
        ? `
          <div class="score-details">
            <div class="score-scorers">
              <div class="score-scorer-team">
                <span class="score-scorer-label">TEAM WHITE</span>
                <div class="score-scorer-list">
                  ${whiteScorers}
                </div>
              </div>

              <div class="score-scorer-team">
                <span class="score-scorer-label">TEAM BLACK</span>
                <div class="score-scorer-list">
                  ${blackScorers}
                </div>
              </div>
            </div>
          </div>
        `
        : "";

      scoreCard.innerHTML = `
        <div class="game-header">

          <div class="game-date">${game.date}</div>

          <div class="score">
            <div class="team-away">
              <span class="team-name">White</span>
              <img
                src="../icons/white-jersey.svg"
                alt="White jersey"
                width="25"
                height="25"
              />
              <span class="team-score">${game.whiteAwayScore}</span>
            </div>

            <span class="vs">@</span>

            <div class="team-home">
              <span class="team-score">${game.blackHomeScore}</span>
              <img
                src="../icons/black-jersey.svg"
                alt="Black jersey"
                width="25"
                height="25"
              />
              <span class="team-name">Black</span>
            </div>
          </div>

          ${game.note ? `<div class="game-note">${game.note}</div>` : ""}

          ${playerStats}

        </div>
      `;

      // Expand player stats when tapped on mobile
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
