const router = require("express").Router();
const notificationController = require("../../controller/notification/notificationController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../utils/catchAsync");

router.get(
  "/",
  isAuthenticated,
  catchAsync(notificationController.getNotificationOfUser)
);
router.get(
  "/unread",
  isAuthenticated,
  catchAsync(notificationController.getUnreadNotifications)
);

module.exports = router;
