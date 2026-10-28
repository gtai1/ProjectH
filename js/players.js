// Icons for scouting note types
const scoutingNoteIcons = {
  strength: `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 17 9 11 13 15 21 7"></polyline><polyline points="15 7 21 7 21 13"></polyline></svg>`,
  tendency: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle></svg>`,
  weakness: `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 7 9 13 13 9 21 17"></polyline><polyline points="15 17 21 17 21 11"></polyline></svg>`,
};

// Builds the offensive profile and scouting notes for the back of a player card
function buildScoutingReport(scouting) {
  if (!scouting) {
    return `<p class="scouting-empty">No scouting report yet.</p>`;
  }

  const profile = (scouting.offensiveProfile ?? [])
    .map(
      ({ label, value }) => `
        <div class="scouting-rating">
            <div class="scouting-rating-label">
                <span>${label}</span>
                <span>${value}</span>
            </div>
            <div class="scouting-rating-bar">
                <div class="scouting-rating-fill" style="width: ${value}%"></div>
            </div>
        </div>
      `,
    )
    .join("");

  const notes = (scouting.notes ?? [])
    .map(
      ({ type, title }) => `
        <div class="scouting-note scouting-note-${type}">
            ${scoutingNoteIcons[type] ?? ""}
            <div>
                <strong>${type[0].toUpperCase() + type.slice(1)}: ${title}</strong>
            </div>
        </div>
      `,
    )
    .join("");

  return `
    <section class="scouting-section">
        <h5>Offensive Profile</h5>
        ${profile}
    </section>

    <section class="scouting-section">
        <h5>Scouting Report</h5>
        ${notes}
    </section>
  `;
}

export async function loadPlayers() {
  try {
    // Load both JSON files
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch("../data/players.json"),
      fetch("../data/games.json"),
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

      // Total assists
      const assists = playerGames.reduce((total, game) => {
        const gamePlayer = game.players.find((p) => p.name === player.name);

        return total + (gamePlayer ? gamePlayer.assists : 0);
      }, 0);

      // Total points
      const points = goals + assists;

      // Create player card
      const playerLink = document.createElement("a");
      playerLink.href = `player.html?name=${encodeURIComponent(player.name)}`;
      playerLink.classList.add("player-card-link");

      const playerCard = document.createElement("article");
      playerCard.classList.add("player-card", "player-card-flippable");

      // Right click flips the card instead of opening the context menu
      playerCard.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        playerCard.classList.toggle("is-flipped");
      });

      const imagePath = `../images/${player.image}`;

      playerCard.innerHTML = `
                  <div class="player-card-inner">

                  <div class="player-card-face player-card-front">

                    <div class="player-image">
                        <img src="${imagePath}" alt="${player.name} #${player.number}">
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

                            <div class="stat">
                                <strong>${goals}</strong>
                                <span>G</span>
                            </div>

                            <div class="stat">
                                <strong>${assists}</strong>
                                <span>A</span>
                            </div>

                            <div class="stat">
                                <strong>${points}</strong>
                                <span>P</span>
                            </div>

                        </div>

                    </div>

                  </div>

                  <div class="player-card-face player-card-back">

                    <div class="player-card-back-header">
                        <h4>${player.name} #${player.number}</h4>
                        <div class="player-position">${player.position} | Shoots ${player.handedness} </div>
                    </div>

                    ${buildScoutingReport(player.scouting)}

                  </div>

                  </div>
                `;

      // Add card to the page
      playerLink.appendChild(playerCard);
      playersGrid.appendChild(playerLink);
    });
  } catch (error) {
    console.error("Error loading players:", error);
  }
}

export async function loadPlayerPage() {
  const name = new URLSearchParams(window.location.search).get("name");
  const nameElement = document.getElementById("player-name");
  const dataElement = document.getElementById("player-data");
  const headerElement = document.querySelector(".player-page-header");

  try {
    const [playersResponse, gamesResponse] = await Promise.all([
      fetch("../data/players.json"),
      fetch("../data/games.json"),
    ]);

    const [players, games] = await Promise.all([
      playersResponse.json(),
      gamesResponse.json(),
    ]);

    const player = players.find((item) => item.name === name);

    if (!player) {
      nameElement.textContent = "Player not found";
      return;
    }

    const playerAppearances = games
      .map((game) => ({
        game,
        stats: game.players.find((item) => item.name === player.name),
      }))
      .filter((appearance) => appearance.stats)
      .sort((a, b) => b.game.date.localeCompare(a.game.date));

    const playerGames = playerAppearances.map((appearance) => appearance.stats);

    const goals = playerGames.reduce(
      (total, game) => total + (game.goals ?? 0),
      0,
    );
    const assists = playerGames.reduce(
      (total, game) => total + (game.assists ?? 0),
      0,
    );

    nameElement.textContent = `${player.name} #${player.number}`;
    document.title = `Hockey Hub - ${player.name}`;

    if (headerElement) {
      const playerImageUrl = new URL(
        `../images/${player.image}`,
        document.baseURI,
      );
      headerElement.style.setProperty(
        "--player-header-image",
        `url("${playerImageUrl.href}")`,
      );
    }

    const profileCard = document.createElement("article");
    profileCard.classList.add("player-card", "player-profile-card");

    const playerInfo = document.createElement("div");
    playerInfo.classList.add("player-info");

    const position = document.createElement("div");
    position.classList.add("player-position");
    position.textContent = player.position;

    const statsGrid = document.createElement("div");
    statsGrid.classList.add("player-stats");

    [
      ["GP", playerGames.length],
      ["G", goals],
      ["A", assists],
      ["P", goals + assists],
    ].forEach(([label, value]) => {
      const stat = document.createElement("div");
      stat.classList.add("stat");

      const statValue = document.createElement("strong");
      statValue.textContent = value;

      const statLabel = document.createElement("span");
      statLabel.textContent = label;

      stat.append(statValue, statLabel);
      statsGrid.appendChild(stat);
    });

    playerInfo.append(position, statsGrid);
    profileCard.appendChild(playerInfo);
    dataElement.replaceChildren(profileCard);

    const recordsSection = document.createElement("section");
    recordsSection.classList.add("player-records-section");
    recordsSection.setAttribute("aria-labelledby", "player-records-heading");

    const recordsHeading = document.createElement("h4");
    recordsHeading.id = "player-records-heading";
    recordsHeading.textContent = "Best Games";

    const recordsGrid = document.createElement("div");
    recordsGrid.classList.add("player-records-grid");

    [
      {
        label: "Most Points",
        getValue: (stats) => (stats.goals ?? 0) + (stats.assists ?? 0),
        statLabel: "points",
      },
      {
        label: "Most Goals",
        getValue: (stats) => stats.goals ?? 0,
        statLabel: "goals",
      },
      {
        label: "Most Assists",
        getValue: (stats) => stats.assists ?? 0,
        statLabel: "assists",
      },
    ].forEach(({ label, getValue, statLabel }) => {
      const recordCard = document.createElement("article");
      recordCard.classList.add("player-record-card");

      const recordTitle = document.createElement("h5");
      recordTitle.textContent = label;
      recordCard.appendChild(recordTitle);

      if (playerAppearances.length === 0) {
        const noGames = document.createElement("p");
        noGames.textContent = "No games recorded";
        recordCard.appendChild(noGames);
      } else {
        const record = playerAppearances.reduce((best, appearance) =>
          getValue(appearance.stats) > getValue(best.stats) ? appearance : best,
        );
        const recordValue = document.createElement("strong");
        recordValue.classList.add("player-record-value");
        recordValue.textContent = `${getValue(record.stats)} ${statLabel}`;

        const recordGame = document.createElement("p");
        recordGame.classList.add("player-record-game");
        const date = new Date(
          `${record.game.date}T00:00:00`,
        ).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const awayTeam = record.game.alternateAwayName || "Team Away";
        const homeTeam = record.game.alternateHomeName || "Team Home";
        recordGame.textContent = `${date} · ${awayTeam} ${record.game.awayScore} - ${record.game.homeScore} ${homeTeam}`;

        recordCard.append(recordValue, recordGame);
      }

      recordsGrid.appendChild(recordCard);
    });

    recordsSection.append(recordsHeading, recordsGrid);
    document.querySelector(".player-games-section")?.remove();

    const gamesSection = document.createElement("section");
    gamesSection.classList.add("player-games-section");
    gamesSection.setAttribute("aria-labelledby", "player-games-heading");

    const gamesHeading = document.createElement("h4");
    gamesHeading.id = "player-games-heading";
    gamesHeading.textContent = "Game History";

    const gamesElement = document.createElement("div");
    gamesElement.id = "player-games";

    gamesSection.append(gamesHeading, gamesElement);
    dataElement.insertAdjacentElement("afterend", recordsSection);
    recordsSection.insertAdjacentElement("afterend", gamesSection);

    gamesElement.replaceChildren();
    playerAppearances.forEach(({ game, stats }) => {
      const awayTeam = game.alternateAwayName || "Team Away";
      const homeTeam = game.alternateHomeName || "Team Home";
      const playerTeam = stats.team === "home" ? homeTeam : awayTeam;
      const points = (stats.goals ?? 0) + (stats.assists ?? 0);

      const gameCard = document.createElement("article");
      gameCard.classList.add("player-game-card");

      const gameHeader = document.createElement("div");
      gameHeader.classList.add("player-game-header");

      const gameDate = document.createElement("time");
      gameDate.classList.add("player-game-date");
      gameDate.dateTime = game.date;
      gameDate.textContent = new Date(
        `${game.date}T00:00:00`,
      ).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const gameScore = document.createElement("strong");
      gameScore.classList.add("player-game-score");

      const playerScore =
        stats.team === "home" ? game.homeScore : game.awayScore;
      const opponentScore =
        stats.team === "home" ? game.awayScore : game.homeScore;

      gameScore.textContent = `${awayTeam} ${game.awayScore} - ${game.homeScore} ${homeTeam}`;

      const resultImage = document.createElement("img");
      resultImage.src =
        playerScore > opponentScore
          ? "../icons/green-circle.png"
          : playerScore < opponentScore
            ? "../icons/red-circle.png"
            : "../icons/grey-circle.png";
      resultImage.alt =
        playerScore > opponentScore
          ? "Win"
          : playerScore < opponentScore
            ? "Loss"
            : "Tie";
      resultImage.width = 15;
      resultImage.height = 15;

      gameScore.prepend(resultImage, " ");

      gameHeader.append(gameScore, gameDate);

      const gameStats = document.createElement("div");
      gameStats.classList.add("player-game-stats");

      [
        ["Team", playerTeam],
        [
          "Position",
          stats.position
            ? stats.position[0].toUpperCase() + stats.position.slice(1)
            : "—",
        ],
        ["Goals", stats.goals ?? 0],
        ["Assists", stats.assists ?? 0],
        ["Points", points],
      ].forEach(([label, value]) => {
        const stat = document.createElement("div");
        const statLabel = document.createElement("span");
        const statValue = document.createElement("strong");

        statLabel.textContent = label;
        statValue.textContent = value;
        stat.append(statLabel, statValue);
        gameStats.append(stat);
      });

      gameCard.append(gameHeader, gameStats);
      gamesElement.appendChild(gameCard);
    });
  } catch (error) {
    nameElement.textContent = "Unable to load player";
    console.error("Error loading player page:", error);
  }
}
