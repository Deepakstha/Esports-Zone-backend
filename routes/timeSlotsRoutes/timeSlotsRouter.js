const router = require("express").Router();
const timeSlotsController = require("../../controller/timeSlots/timeSlotsController");
const catchAsync = require("../../utils/catchAsync");

router
  .route("/:tournamentId")
  .post(catchAsync(timeSlotsController.createTimeSlot));

router.route("/").get(catchAsync(timeSlotsController.getAllTimeSlots));
router.get(
  "/tournament/:tournamentId",
  timeSlotsController.displayTimeSlotByTournamentId
);

router
  .route("/:timeSlotId")
  .get(catchAsync(timeSlotsController.getSingleTimeSlot))
  .patch(catchAsync(timeSlotsController.updateTimeSlot))
  .delete(catchAsync(timeSlotsController.deleteTimeSlot));

module.exports = router;
