const db = require("../../model");

exports.displayLeaderBoardOfTeam = async (req, res, next) => {
  const teams = await db.teams.findAll({
    attributes: ["teamName", "logo", "wins", "tournamentsPlayed"],
    order: [["wins", "DESC"]],
    limit: 100,
  });
  return res.json({ teams });
};

// Displaying leaderboard of the solo players
exports.displayLeaderBoardOfSoloPlayer = async (req, res, next) => {
  const players = await db.user.findAll({
    attributes: ["userName", "avatar", "wins"],
    where: { role: { [db.Sequelize.Op.ne]: "admin" } },
    order: [["wins", "DESC"]],
    limit: 100,
  });
  return res.json({ players });
};
