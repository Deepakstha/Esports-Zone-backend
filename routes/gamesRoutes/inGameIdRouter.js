const inGameId = require("../../controller/game/inGameController");
const { givePermissionTo } = require("../../middleware/givePermission");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");
const router = require("express").Router();

router
  .route("/")
  .post(isAuthenticated, catchAsync(inGameId.createInGameId))
  .get(catchAsync(isAuthenticated), catchAsync(inGameId.getUserInGameIds));

router.get(
  "/all",
  isAuthenticated,
  givePermissionTo(["admin"]),
  catchAsync(inGameId.getAllInGameId)
);
router
  .route("/:id")
  .patch(catchAsync(isAuthenticated), catchAsync(inGameId.updateInGameId))
  .delete(catchAsync(isAuthenticated), catchAsync(inGameId.deleteInGameId));

module.exports = router;
