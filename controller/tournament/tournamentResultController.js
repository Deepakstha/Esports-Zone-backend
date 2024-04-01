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
  console.log(tournamentResult, "Result");
  tournamentResult?.map(async (e) => {
    if (e.dataValues.placement == 1) {
      if (e.dataValues.teamId) {
        const team = await Team.findByPk(e.dataValues.teamId);
        team.wins = team.wins + 1;
        team.save();

        return `${e.dataValues.teamId} team`;
      } else {
        const user = await User.findByPk(e.dataValues.userId);
        user.wins = user.wins + 1;
        user.save();
        return `Player ${e.dataValues.userId}`;
      }
    }
  });

  // const findTeam = await Team.findByPk(teamId);
  //   findTeam.wins = findTeam.wins + 1;
  //   findTeam.save();
  if (!tournamentResult) {
    return res.json({ message: "Cannot add tournament result" });
  }
  return res.json({ message: "Tournament Result Added", status: 200 });
};

exports.displayAllTournamentsResult = async (req, res) => {
  const allTournamentsResult = await TournamentResult.findAll({
    include: [
      { model: Tournament, required: true },
      { model: TimeSlot, require: true },
      { model: Team, require: true },
      { model: User, require: true },
    ],
  });
  if (allTournamentsResult == 0) {
    return res.json({ message: "No Tournament Result", status: 404 });
  }
  return res.json({ allTournamentsResult, status: 200 });
};

//displaying one tournament result
exports.displayTournamentResult = async (req, res) => {
  const { tournamentId } = req.params;
  const tournamentResult = await TournamentResult.findAll({
    where: { tournamentId },
    include: [
      { model: Tournament, attributes: ["tournamentName"] },
      { model: TimeSlot, attributes: ["startTime", "endTime"] },
      { model: Team, attributes: ["teamName"] },
      { model: User, attributes: ["username"] },
    ],
  });

  if (!tournamentResult) {
    return res.json({ message: "No Tournament Result", status: 404 });
  }

  const uniqueTimeSlot = await TournamentResult.findAll({
    where: { tournamentId },
    attributes: ["timeSlotId"],
    include: [{ model: TimeSlot, attributes: ["startTime", "endTime"] }],

    group: ["timeSlotId"],
  });

  // const
  return res.json({ tournamentResult, uniqueTimeSlot, status: 200 });
};

// Updating tournament Result in Bulk
exports.updateTournamentResultInBulk = async (req, res) => {
  const { winners } = req.body;

  let updatedData = [];
  for (const item of winners) {
    const data = await TournamentResult.update(
      { teamId: item.teamId, userId: item.userId },
      {
        where: {
          timeSlotId: item.timeSlotId,
          id: item.id,
          tournamentId: item.tournamentId,
        },
      }
    );
    updatedData.push(data);
  }
  console.log(updatedData, "UPDATED DATA");

  if (updatedData != winners) {
    return res.status(400).json({ message: "Tournament no updated" });
  }

  return res.json({ message: "Tournament Result Updated!" });
};

//Deleting tournament Result
exports.deleteTournamentResult = async (req, res) => {
  const { id } = req.params;
  const tournamentResult = await TournamentResult.findByPk(id);
  if (!tournamentResult) {
    return res.json({
      message: "This Tournament Result doesnot Exist",
      status: 400,
    });
  }
  await TournamentResult.destroy({ where: { id: req.params.id } });
  return res.json({ message: "Tournament Deleted", status: 200 });
};
