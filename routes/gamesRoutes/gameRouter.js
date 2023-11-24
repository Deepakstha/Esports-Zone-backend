const gamesController = require("../../controller/game/gameController");
const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");
const { givePermissionTo } = require("../../middleware/givePermission");
const { gamesImagesUpload } = require("../../services/multer");

router
  .route("/")
  .post(
    catchAsync(isAuthenticated),
    givePermissionTo(["admin"]),
    gamesImagesUpload,
    catchAsync(gamesController.createGames)
  )
  .get(catchAsync(gamesController.getAllGames));
router
  .route("/:id")
  .get(catchAsync(gamesController.getById))
  .patch(
    isAuthenticated,
    givePermissionTo(["admin"]),
    gamesImagesUpload,
    catchAsync(gamesController.updateGameById)
  )
  .delete(
    isAuthenticated,
    givePermissionTo(["admin"]),
    catchAsync(gamesController.deleteGameById)
  );

module.exports = router;
