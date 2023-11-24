module.exports = (sequelize, DataTypes) => {
  const Games = sequelize.define("games", {
    gameName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gameCoverImage: {
      type: DataTypes.TEXT,
    },
    gameIcon: {
      type: DataTypes.TEXT,
    },
  });
  return Games;
};
