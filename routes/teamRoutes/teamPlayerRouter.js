const teamPlayerController = require("../../controller/team/teamPlayerController");
const checkOptionalAuth = require("../../middleware/checkOptionalAuth");
const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");

router
  .route("/sendTeamJoiningRequest/:teamId")
  .get(isAuthenticated, catchAsync(teamPlayerController.sendTeamJoinRequest));

router
  .route("/teamRequestAccept/:request_token")
  .get(
    isAuthenticated,
    catchAsync(teamPlayerController.viewDetailsOfSendingRequestUser)
  )
  .post(
    isAuthenticated,
    catchAsync(teamPlayerController.acceptTeamJoinRequest)
  );

router.post(
  "/reject-request",
  isAuthenticated,
  catchAsync(teamPlayerController.rejectTeamJoiningRequest)
);

router.get(
  "/allTeamMembers/:teamId",
  catchAsync(teamPlayerController.displayAllTeamMembers)
);

router.get(
  "/user-teams",
  isAuthenticated,
  catchAsync(teamPlayerController.displayPlayersTeam)
);

router.patch(
  "/change-role/:teamId",
  isAuthenticated,
  catchAsync(teamPlayerController.changeLeaderOfTeam)
);
router.delete(
  "/remove-player/:teamId",
  isAuthenticated,
  catchAsync(teamPlayerController.removePlayerFromTeam)
);

router.delete(
  "/leave-team/:teamId",
  isAuthenticated,
  catchAsync(teamPlayerController.leaveTeam)
);

router.get(
  "/checkteamrole/:teamId",
  checkOptionalAuth,
  teamPlayerController.checkTeamRole
);

module.exports = router;
