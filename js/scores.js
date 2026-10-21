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
        // .filter((player) => player.goals > 0 || player.assists > 0)
        .sort(
          (a, b) =>
            b.goals - a.goals || b.assists - a.assists
        );

      // Format each player's statistics
      const formatPlayer = (player) => `
        <span class="score-player-stat">
          <div>
            <strong>${player.name}</strong> ${player.position === 'forward' ? '<img src="../icons/letter-f.png" alt="f" title="Forward" width="10" height="10" />' : player.position === 'defense' ? '<img src="../icons/letter-d.png" alt="d" title="Defense" width="10" height="10" />' : player.position === 'goalie' ? '<img src="../icons/letter-g.png" alt="g" title="Goalie" width="10" height="10" />' : ''}
          </div>
          <span>
            ${player.goals}G · ${player.assists}A · ${player.goals + player.assists}P
          </span>
        </span>
      `;

      // Separate players by team
      const awayScorers = scorers
        .filter((player) => player.team === "away")
        .map(formatPlayer)
        .join("");

      const homeScorers = scorers
        .filter((player) => player.team === "home")
        .map(formatPlayer)
        .join("");

      const playerStats = awayScorers || homeScorers
        ? `
          <div class="score-details">
            <div class="score-scorers">
              <div class="score-scorer-team">
                <span class="score-scorer-label">${game.alternateAwayName ? game.alternateAwayName.toUpperCase() : 'TEAM AWAY'}</span>
                <div class="score-scorer-list">
                  ${awayScorers}
                </div>
              </div>

              <div class="score-scorer-team">
                <span class="score-scorer-label">${game.alternateHomeName ? game.alternateHomeName.toUpperCase() : 'TEAM HOME'}</span>
                <div class="score-scorer-list">
                  ${homeScorers}
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
              <span class="team-name">${game.alternateAwayName ? game.alternateAwayName : 'Team Away'}</span>
              <img
                src="../icons/white-jersey.svg"
                alt="White jersey"
                width="25"
                height="25"
              />
              <span class="team-score">${game.awayScore}</span>
            </div>

            <span class="vs">@</span>

            <div class="team-home">
              <span class="team-score">${game.homeScore}</span>
              <img
                src="../icons/black-jersey.svg"
                alt="Black jersey"
                width="25"
                height="25"
              />
              <span class="team-name">${game.alternateHomeName ? game.alternateHomeName : 'Team Home'}</span>
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
