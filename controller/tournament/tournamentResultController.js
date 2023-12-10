const TournamentResult = require("../../model").tournamentResult;
const Tournament = require("../../model").tournament;
const TimeSlot = require("../../model").timeSlots;
const Team = require("../../model").teams;
const User = require("../../model").user;
const { Op } = require("sequelize");

exports.createTournamentResult = async (req, res) => {
  const { winners } = req.body;
  let placementExist;
  const tournamentResultExist = await TournamentResult.findAll({
    where: {
      [Op.or]: winners.map((item) => ({
        ...item,
        [Op.and]: Object.entries(item).map(([key, value]) => ({
          [key]: value,
        })),
      })),
    },
  });

  if (tournamentResultExist.length === winners.length) {
    return res.json({ message: "Tournament Result Exist" });
  }

  const checkPlacement = async (element) => {
    const result = await TournamentResult.findOne({
      where: {
        tournamentId: element.tournamentId,
        timeSlotId: element.timeSlotId,
        placement: element.placement,
      },
    });

    if (result) {
      return `Placement ${element.placement} is Already in this tournament`;
    }
  };

  for (const item of winners) {
    placementExist = await checkPlacement(item);
    if (placementExist) {
      break;
    }
  }
  if (placementExist) {
    return res.json({ message: placementExist });
  }

  const tournamentResult = await TournamentResult.bulkCreate(winners);
  if (!tournamentResult) {
    return res.json({ message: "Cannot add tournament result" });
  }
  return res.json({ message: "Tournament Result Added" });
};
