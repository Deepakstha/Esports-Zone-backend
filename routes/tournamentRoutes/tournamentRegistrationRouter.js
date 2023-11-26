const tournamentRegistrationController = require("../../controller/tournament/tournamentRegistration");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");

const router = require("express").Router();

router.post(
  "/",
  catchAsync(isAuthenticated),
  catchAsync(tournamentRegistrationController.tournamentRegistration)
);

router.get(
  "/",
  catchAsync(isAuthenticated),
  catchAsync(tournamentRegistrationController.getTournamentRegistration)
);

router.post(
  "/tournament",
  isAuthenticated,
  catchAsync(
    tournamentRegistrationController.displayTournamentRegistrationByTournamentId
  )
);

router.get(
  "/:id",
  catchAsync(isAuthenticated),
  catchAsync(tournamentRegistrationController.getOneTournamentRegistraion)
);
router.delete(
  "/:id",
  catchAsync(isAuthenticated),
  catchAsync(tournamentRegistrationController.deleteOneTournamentRegistration)
);
router.get(
  "/participants/:tournamentId",
  catchAsync(tournamentRegistrationController.displayParticipantsOfTournament)
);
router.get(
  "/participants/:tournamentId/:timeSlotId",
  tournamentRegistrationController.displayTournamentRegistrationByTournamentIdToPublic
);
module.exports = router;
