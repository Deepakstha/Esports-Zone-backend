module.exports = (sequelize, DataTypes) => {
  const TeamPlayers = sequelize.define("teamPlayers", {
    role: {
      type: DataTypes.ENUM("player", "leader"),
      defaultValue: "player",
      allowNull: false,
    },
  });
  return TeamPlayers;
};
