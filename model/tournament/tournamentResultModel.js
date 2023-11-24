module.exports = (sequelize, DataTypes) => {
  const TournamentResult = sequelize.define("tournamentResult", {
    placement: {
      type: DataTypes.STRING,
    },
  });
  return TournamentResult;
};
