const leaderBoardController = require("../../controller/leaderBoard/leaderBoardController");
const catchAsync = require("../../utils/catchAsync");
const router = require("express").Router();

router.get(
  "/teams",
  catchAsync(leaderBoardController.displayLeaderBoardOfTeam)
);

router.get(
  "/solo",
  catchAsync(leaderBoardController.displayLeaderBoardOfSoloPlayer)
);
module.exports = router;
