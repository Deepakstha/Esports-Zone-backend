module.exports = (sequelize, DataTypes) => {
  const PrizePoll = sequelize.define("prizePool", {
    prize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    placements: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return PrizePoll;
};
