const router = require("express").Router();
const prizePoolController = require("../../controller/prizePool/prizePoolController");
const { givePermissionTo } = require("../../middleware/givePermission");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");

router
  .route("/")
  .post(
    isAuthenticated,
    givePermissionTo(["admin"]),
    catchAsync(prizePoolController.createPrizePool)
  )
  .get(catchAsync(prizePoolController.getAllPrizePool));

router.get(
  "/tournament/:tournamentId",
  catchAsync(prizePoolController.displayPrizePoolByTournamentId)
);

router
  .route("/:id")
  .get(catchAsync(prizePoolController.getSinglePrizePool))
  .patch(
    isAuthenticated,
    givePermissionTo(["admin"]),
    catchAsync(prizePoolController.updatePrizePool)
  )
  .delete(
    isAuthenticated,
    givePermissionTo(["admin"]),
    catchAsync(prizePoolController.deletePrizePool)
  );

module.exports = router;
