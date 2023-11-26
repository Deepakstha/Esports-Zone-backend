const db = require("../../model");
const TournamentRegistration = db.tournamentRegistration;

exports.tournamentRegistration = async (req, res) => {
  const { tournamentId, timeSlotId, gameId, teamId } = req.body;
  const userId = req.user.id;

  let tournamentExist;
  if (teamId) {
    try {
      tournamentExist = await TournamentRegistration.findOne({
        where: { tournamentId, timeSlotId, gameId, teamId },
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: error.message, error: "this is error" });
    }
  }
  if (userId) {
    try {
      tournamentExist = await TournamentRegistration.findOne({
        where: { tournamentId, timeSlotId, gameId, userId },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ message: error.message, error: "this is error" });
    }
  }
  if (tournamentExist) {
    return res
      .status(400)
      .json({ message: "Tournament Registration already exist!" });
  }

  const wallet = await db.wallet.findOne({ where: { userId } });
  const tournament = await db.tournament.findOne({
    where: { id: tournamentId },
    attributes: ["id", "tournamentEntryFee"],
  });
  // return res.json({ wallet, tournament });

  if (wallet.balance < tournament.tournamentEntryFee) {
    return res.status(400).json({
      message: "You don't have sufficient balance",
      balance: wallet.balance,
      entryFee: tournament.tournamentEntryFee,
      status: 400,
    });
  }

  if (wallet.balance >= tournament.tournamentEntryFee) {
    wallet.balance = wallet.balance - tournament.tournamentEntryFee;
    await wallet.save();
  }

  /*

  if (teamId) {
    const team = await db.teams.findOne({ where: { id: teamId } });
    team.tournamentsPlayed = team.tournamentsPlayed + 1;
    team.save();
  }
  if (userId) {
    const user = await db.user.findOne({ where: { id: userId } });
    user.tournamentsPlayed = user.tournamentsPlayed + 1;
    user.save();
  }
  */
  //tournament registration
  const tournamentReg = await TournamentRegistration.create({
    tournamentId,
    timeSlotId,
    userId,
    gameId,
    teamId,
  });

  // Payment Registration
  const registartionPayment = await db.registrationPayment.create({
    tournamentRegistrationId: tournamentReg.id,
    userId,
    amount: tournament.tournamentEntryFee,
  });

  return res.status(201).json({
    message: "Tournament Registraton Success",
    tournamentReg,
    registartionPayment,
  });
};

//Display all tournament registration from
exports.getTournamentRegistration = async (req, res) => {
  const tournamentRegistration = await TournamentRegistration.findAll({
    include: [
      { model: db.tournament },
      { model: db.timeSlots },
      { model: db.user, attributes: ["id", "username", "fullname", "email"] },
      { model: db.games },
      { model: db.teams },
    ],
  });
  if (tournamentRegistration == 0) {
    return res.status(404).json({ message: "No Tournament Registration" });
  }
  return res.status(200).json({ tournamentRegistration });
};

// Display tournament Registration according tournamen id and time slot id
exports.displayTournamentRegistrationByTournamentId = async (req, res) => {
  const { timeSlotId, tournamentId } = req.body;

  const tournamentRegistration = await TournamentRegistration.findAll({
    where: { timeSlotId, tournamentId },
    include: [
      { model: db.tournament },
      { model: db.timeSlots },
      { model: db.user, attributes: ["id", "username", "fullname", "email"] },
      { model: db.games },
      { model: db.teams },
    ],
  });
  const tournamentPrize = await db.prizePool.findAll({
    where: { tournamentId },
  });
  return res.status(200).json({ tournamentRegistration, tournamentPrize });
};
exports.displayTournamentRegistrationByTournamentIdToPublic = async (
  req,
  res
) => {
  const { timeSlotId, tournamentId } = req.params;

  const tournamentRegistration = await TournamentRegistration.findAll({
    where: { timeSlotId, tournamentId },
    include: [
      {
        model: db.user,
        attributes: ["id", "username", "avatar", "wins"],
      },
      { model: db.teams },
    ],
  });

  return res.status(200).json({ tournamentRegistration });
};

// Display tournament Registration according to tournamentId
exports.displayParticipantsOfTournament = async (req, res) => {
  const { tournamentId } = req.params;
  const tournamentRegistartion = await TournamentRegistration.findAll({
    where: { tournamentId },
    include: [
      {
        model: db.user,
        attributes: ["id", "username", "fullname", "email", "avatar"],
      },
      { model: db.teams, attributes: ["id", "teamName", "logo"] },
    ],
  });
  return res.status(200).json({ tournamentRegistartion });
};

//Display one tournament Registration
exports.getOneTournamentRegistraion = async (req, res) => {
  const { id } = req.params;
  const tournamentRegistration = await TournamentRegistration.findByPk(id, {
    include: [
      { model: db.tournament },
      { model: db.timeSlots },
      { model: db.user, attributes: ["id", "username", "fullname", "email"] },
      { model: db.games },
      { model: db.teams },
    ],
  });
  if (!tournamentRegistration) {
    return res.status(404).json({ message: "No Tournament Register" });
  }
  return res.status(200).json({ tournamentRegistration });
};

//Delete tournament
exports.deleteOneTournamentRegistration = async (req, res) => {
  const { id } = req.params;
  const findTournamentRegistration = await TournamentRegistration.findByPk(id);
  if (!findTournamentRegistration) {
    return res.status(404).json({
      message: "No Tournament Registration You want to delete",
    });
  }
  const deleteTournament = await TournamentRegistration.destroy({
    where: { id },
  });
  if (deleteTournament == 1) {
    return res.status(200).json({
      message: "Tournament Registration Deleted!",
    });
  }
  return res
    .status(400)
    .json({ message: "Unable to Delete Tournament Registration" });
};
