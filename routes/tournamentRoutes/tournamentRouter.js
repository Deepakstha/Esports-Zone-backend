const tournamentController = require("../../controller/tournament/tournamentController");
const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const { givePermissionTo } = require("../../middleware/givePermission");
const catchAsync = require("../../utils/catchAsync");
const { tournamentUpload } = require("../../services/multer");

router
  .route("/")
  .post(
    isAuthenticated,
    givePermissionTo(["admin"]),
    tournamentUpload,
    catchAsync(tournamentController.createTournament)
  )
  .get(catchAsync(tournamentController.getAllTournament));

router.get(
  "/featured-tournament",
  catchAsync(tournamentController.getAllFeaturedTournament)
);
router.get(
  "/upcoming-tournament",
  catchAsync(tournamentController.displayUpcomingTournament)
);

router.get(
  "/ongoing-tournament",
  catchAsync(tournamentController.displayOnGoingTournament)
);

router.get(
  "/past-tournament",
  catchAsync(tournamentController.displayPastTournament)
);

router
  .route("/:id")
  .get(catchAsync(tournamentController.getOneTournament))
  .patch(
    isAuthenticated,
    givePermissionTo(["admin"]),
    tournamentUpload,
    catchAsync(tournamentController.updateTournament)
  )
  .delete(
    isAuthenticated,
    givePermissionTo(["admin"]),
    catchAsync(tournamentController.deleteTournament)
  );

module.exports = router;
