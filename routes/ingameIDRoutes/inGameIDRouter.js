const ingameidController = require("../../controller/game/inGameController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");
const router = require("express").Router();

router.get("/", catchAsync(ingameidController.getAllInGameId));
router.get(
  "/user",
  isAuthenticated,
  catchAsync(ingameidController.getUserInGameIds)
);
router.get("/one", catchAsync(ingameidController.getOneInGameId));
router.get(
  "/delete",
  isAuthenticated,
  catchAsync(ingameidController.deleteInGameId)
);
router.patch(
  "/update",
  isAuthenticated,
  catchAsync(ingameidController.updateInGameId)
);

router.post(
  "/",
  isAuthenticated,
  catchAsync(ingameidController.createInGameId)
);
module.exports = router;
