export function tallyPlayerGoals(games) {
  return games.reduce((totals, game) => {
    game.players.forEach(player => {
      if (!totals[player.name]) {
        totals[player.name] = {
          goals: 0,
          postGoals: 0,
          totalGoals: 0
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
