const router = require("express").Router();
const passport = require("passport");

const {
  googleFunc,
} = require("../../controller/userController/googleAuthController");

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  googleFunc
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

module.exports = router;
