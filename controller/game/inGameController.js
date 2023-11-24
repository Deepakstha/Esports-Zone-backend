const customErrorHandler = require("../../utils/customerErrorHandler");
const { games, user } = require("../../model");
const InGameId = require("../../model").inGameId;

// Create InGameID
exports.createInGameId = async (req, res) => {
  const { playerId, gameId } = req.body;
  const userId = req.user.id;
  const inGameIdExist = await InGameId.findOne({
    where: {
      playerId,
      gameId,
      userId,
    },
  });

  if (inGameIdExist) {
    return res
      .status(409)
      .json({ message: "inGameId already exist!", status: 409 });
  }

  const gameInGameIdExist = await InGameId.findOne({
    where: { gameId, userId },
  });

  if (gameInGameIdExist) {
    return res.status(400).json({ message: "Game InGameId exist!" });
  }

  const checkUniqueInGameIdForGame = await InGameId.findOne({
    where: { playerId, gameId },
  });

  if (checkUniqueInGameIdForGame) {
    return res
      .status(400)
      .json({ message: "InGameID already exist for this Game" });
  }

  const game = await games.findOne({
    where: { id: gameId },
    attributes: ["gameName"],
  });
  const ingameIdCreation = await InGameId.create({ playerId, gameId, userId });
  return res
    .status(200)
    .json({ message: "InGameID created", ingameIdCreation, game, status: 200 });
};

//Get all InGameID
exports.getAllInGameId = async (req, res) => {
  const allInGameId = await InGameId.findAll({
    include: [
      {
        model: games,
        attributes: ["gameName"],
      },
      {
        model: user,
        attributes: ["fullname", "username", "email"],
      },
    ],
  });
  if (allInGameId == 0) {
    return res.status(204).json({ message: "No InGameID", status: 204 });
  }
  return res.status(200).json({ allInGameId, status: 200 });
};

exports.getUserInGameIds = async (req, res) => {
  const userId = req.user.id;
  const getInGameIds = await InGameId.findAll({
    where: { userId },
    include: [
      {
        model: games,
        attributes: ["gameName"],
      },
    ],
  });
  if (getInGameIds == 0) {
    return res.status(204).json({ message: "No InGameID", status: 204 });
  }
  return res.status(200).json({ InGameIds: getInGameIds, status: 200 });
};

//Get One InGameID
exports.getOneInGameId = async (req, res) => {
  const { id } = req.params;
  const InGameIds = await InGameId.findOne({
    where: { id },
    include: [
      {
        model: games,
        attributes: ["gameName"],
      },
      {
        model: user,
        attributes: ["fullname", "username", "email"],
      },
    ],
  });
  if (!InGameIds) {
    return res.status(404).json({ message: "No InGameID Found!", status: 404 });
  }
  return res.status(200).json({ InGameIds, status: 200 });
};

//Update One InGameID
exports.updateInGameId = async (req, res, next) => {
  const { playerId, gameId } = req.body;
  const userId = req.user.id;
  const InGameIdCheck = await InGameId.findByPk(req.params.id);
  if (!InGameId) {
    return res
      .status(404)
      .json({ message: "Could not find InGameId to update", status: 404 });
  }
  if (userId !== InGameIdCheck.userId)
    return next(
      customErrorHandler(401, "you are not authorize to update this ingameId")
    );
  InGameIdCheck.playerId = playerId;
  InGameIdCheck.gameId = gameId;
  InGameIdCheck.save();
  return res.status(200).json({ message: "InGameID updated!", status: 200 });
};

// Delete InGameID
exports.deleteInGameId = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const inGameIdExist = await InGameId.findByPk(id);
  if (!inGameIdExist) {
    return res.status(404).json({ message: "No InGameID", status: 404 });
  }
  await InGameId.destroy({ where: { id: req.params.id, userId } });
  return res.status(200).json({ message: "InGameID Deleted!", status: 200 });
};
