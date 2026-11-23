export async function loadGames() {
  try {
    const response = await fetch("../data/games.json");

    if (!response.ok) {
      throw new Error("Unable to load games.json");
    }

    const games = await response.json();
    const scoresData = document.getElementById("scores-data");

    scoresData.innerHTML = "";

    games.forEach((game) => {

      const date = new Date(`${game.date}T00:00:00`);

      const formattedDate = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      const scoreCard = document.createElement("a");
      scoreCard.classList.add("score-card");
      scoreCard.href = `./game.html?game=${game.date}`;

      const scorers = game.players.sort((a, b) =>(b.goals + b.assists) - (a.goals + a.assists) || b.goals - a.goals);

      // Format each player's statistics
      const formatPlayer = (player) => `
        <span class="score-player-stat">
          <div>
            ${player.position === 'forward' ? '<img src="../icons/letter-f.png" alt="f" title="Forward" width="10" height="10" />' : player.position === 'defense' ? '<img src="../icons/letter-d.png" alt="d" title="Defense" width="10" height="10" />' : player.position === 'goalie' ? '<img src="../icons/letter-g.png" alt="g" title="Goalie" width="10" height="10" />' : ''} <strong>${player.name}</strong>
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

          <div class="game-date">${formattedDate}</div>

          <div class="score">
            <div class="team-away">
              <span class="team-name">${game.alternateAwayName ? game.alternateAwayName : 'Team Away'}</span>
              <img src="../icons/${game.alternateAwayColour ? game.alternateAwayColour : 'white'}-jersey.png" alt="Away jersey" width="25" height="25">
              <span class="team-score">${game.awayScore}</span>
            </div>

            <span class="vs">@</span>

            <div class="team-home">
              <span class="team-score">${game.homeScore}</span>
              <img src="../icons/${game.alternateHomeColour ? game.alternateHomeColour : 'black'}-jersey.png" alt="Home jersey" width="25" height="25">
              <span class="team-name">${game.alternateHomeName ? game.alternateHomeName : 'Team Home'}</span>
            </div>
          </div>

          ${game.note ? `<div class="game-note">${game.note}</div>` : ""}

          ${playerStats}

        </div>
      `;

      scoresData.prepend(scoreCard);
    });
  } catch (error) {
    console.error("Error loading scores:", error);
  }
}

export async function loadGamePage() {
  const gameId = new URLSearchParams(window.location.search).get("game");
  const gameDate = gameId?.replace(/-game$/, "");
  const nameElement = document.getElementById("game-name");
  const dataElement = document.getElementById("game-data");

  try {
    if (!gameDate) {
      nameElement.textContent = "Game not found";
      return;
    }

    const response = await fetch("../data/games.json");

    if (!response.ok) {
      throw new Error("Unable to load games.json");
    }

    const games = await response.json();
    const game = games.find((item) => item.date === gameDate);

    if (!game) {
      nameElement.textContent = "Game not found";
      return;
    }

    const date = new Date(`${game.date}T00:00:00`);
    const formattedDate = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    nameElement.textContent = formattedDate;
    document.title = `Hockey Hub - ${formattedDate}`;

    const scoreCard = document.createElement("article");
    scoreCard.classList.add("score-card", "game-page-card");

    const gameHeader = document.createElement("div");
    gameHeader.classList.add("game-header");

    const gameDateElement = document.createElement("time");
    gameDateElement.classList.add("game-date");
    gameDateElement.dateTime = game.date;
    gameDateElement.textContent = formattedDate;
    gameDateElement.style.display = "block";

    const score = document.createElement("div");
    score.classList.add("score");

    const createTeam = (side, teamName, color, teamScore) => {
      const team = document.createElement("div");
      team.classList.add(`team-${side}`);

      const name = document.createElement("span");
      name.classList.add("team-name");
      name.textContent = teamName;

      const jersey = document.createElement("img");
      jersey.src = `../icons/${color}-jersey.png`;
      jersey.alt = `${side === "away" ? "Away" : "Home"} jersey`;
      jersey.width = 25;
      jersey.height = 25;

      const scoreValue = document.createElement("span");
      scoreValue.classList.add("team-score");
      scoreValue.textContent = teamScore;

      if (side === "away") {
        team.append(name, jersey, scoreValue);
      } else {
        team.append(scoreValue, jersey, name);
      }

      return team;
    };

    score.append(
      createTeam(
        "away",
        game.alternateAwayName || "Team Away",
        game.alternateAwayColour || "white",
        game.awayScore,
      ),
    );

    const versus = document.createElement("span");
    versus.classList.add("vs");
    versus.textContent = "@";
    score.append(versus);

    score.append(
      createTeam(
        "home",
        game.alternateHomeName || "Team Home",
        game.alternateHomeColour || "black",
        game.homeScore,
      ),
    );

    gameHeader.append(gameDateElement, score);

    if (game.note) {
      const note = document.createElement("div");
      note.classList.add("game-note");
      note.textContent = game.note;
      gameHeader.appendChild(note);
    }

    const scoreDetails = document.createElement("div");
    scoreDetails.classList.add("score-details");

    const scoreScorers = document.createElement("div");
    scoreScorers.classList.add("score-scorers");

    ["away", "home"].forEach((side) => {
      const teamScorers = document.createElement("div");
      teamScorers.classList.add("score-scorer-team");

      const teamLabel = document.createElement("span");
      teamLabel.classList.add("score-scorer-label");
      teamLabel.textContent = (
        side === "away"
          ? game.alternateAwayName || "Team Away"
          : game.alternateHomeName || "Team Home"
      ).toUpperCase();

      const scorerList = document.createElement("div");
      scorerList.classList.add("score-scorer-list");

      game.players
        .filter((player) => player.team === side)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
        .forEach((player) => {
          const playerStat = document.createElement("span");
          playerStat.classList.add("score-player-stat");

          const playerName = document.createElement("div");
          const strongName = document.createElement("strong");
          strongName.textContent = player.name;
          playerName.appendChild(strongName);

          const stats = document.createElement("span");
          const goals = player.goals ?? 0;
          const assists = player.assists ?? 0;
          stats.textContent = `${goals}G · ${assists}A · ${goals + assists}P`;

          playerStat.append(playerName, stats);
          scorerList.appendChild(playerStat);
        });

      teamScorers.append(teamLabel, scorerList);
      scoreScorers.appendChild(teamScorers);
    });

    scoreDetails.appendChild(scoreScorers);
    gameHeader.appendChild(scoreDetails);
    scoreCard.appendChild(gameHeader);
    dataElement.replaceChildren(scoreCard);
  } catch (error) {
    nameElement.textContent = "Unable to load game";
    console.error("Error loading game page:", error);
  }
}
