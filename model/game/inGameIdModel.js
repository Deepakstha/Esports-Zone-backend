module.exports = (sequelize, DataTypes) => {
  const InGameId = sequelize.define("inGameId", {
    playerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return InGameId;
};
