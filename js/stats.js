export async function loadGoals() {
  try {
    const response = await fetch("./games.json");

    if (!response.ok) {
      throw new Error("Unable to load data.json");
    }

    const games = await response.json();
    const playerGoals = tallyPlayerGoals(games);
    console.log(playerGoals);
    const statsBody = document.getElementById("stats-body");

    Object.entries(playerGoals).forEach(([name, stats]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${name}</td>
                <td>${stats.goals}</td>
                <td>${stats.postGoals}</td>
                <td><strong>${stats.totalGoals}</strong></td>
            `;
      statsBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading player stats:", error);
  }
}

export function tallyPlayerGoals(games) {
  return games.reduce((totals, game) => {
    game.players.forEach((player) => {
      if (!totals[player.name]) {
        totals[player.name] = {
          goals: 0,
          postGoals: 0,
          totalGoals: 0,
        };
      }

      totals[player.name].goals += player.goals;
      totals[player.name].postGoals += player.postGoals;
      totals[player.name].totalGoals =
        totals[player.name].goals + totals[player.name].postGoals;
    });

    return totals;
  }, {});
}
