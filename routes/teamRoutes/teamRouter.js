const teamController = require("../../controller/team/teamController");
const router = require("express").Router();
const { teamLogo } = require("../../services/multer");
const isAuthenticated = require("../../middleware/isAuthenticated");

router
  .route("/")
  .post(
    isAuthenticated,
    teamLogo.single("teamLogo"),
    catchAsync(teamController.createTeams)
  )
  .get(catchAsync(teamController.getAllTeams));

router.get(
  "/teamsOfPlayer",
  isAuthenticated,
  catchAsync(teamController.displayTeamsByUserId)
);

router.get("/display-top-squad", catchAsync(teamController.displayTopTenSquad));

router
  .route("/:id")
  .get(catchAsync(teamController.getById))
  .delete(isAuthenticated, catchAsync(teamController.deleteById))
  .patch(
    isAuthenticated,
    teamLogo.single("teamLogo"),
    catchAsync(teamController.updateById)
  );

router
  .route("/invite/:id")
  .get(isAuthenticated, catchAsync(teamController.inviteLinks));

router
  .route("/joinTeam/:joining_token")
  .get(isAuthenticated, catchAsync(teamController.teamJoiningWithInviteLinks));

module.exports = router;
