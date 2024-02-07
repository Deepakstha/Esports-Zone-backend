const tournamentResultController = require("../../controller/tournament/tournamentResultController");
const catchAsync = require("../../utils/catchAsync");
const router = require("express").Router();

router
  .route("/")
  .post(catchAsync(tournamentResultController.createTournamentResult))
  .get(catchAsync(tournamentResultController.displayAllTournamentsResult));

router
  .route("/:tournamentId")
  .get(catchAsync(tournamentResultController.displayTournamentResult));

router.patch(
  "/",
  catchAsync(tournamentResultController.updateTournamentResultInBulk)
);

router.delete(
  "/:id",
  catchAsync(tournamentResultController.deleteTournamentResult)
);

module.exports = router;
