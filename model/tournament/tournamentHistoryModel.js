module.exports = (sequelize, DataTypes) => {
  const TournamentHistory = sequelize.define("tournamentHistory", {});
  return TournamentHistory;
};
