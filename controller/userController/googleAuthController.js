const passport = require("passport");
const bcrypt = require("bcrypt");
const db = require("../../model");
const { createToken } = require("../../utils/tokenManager");
exports.googleAuth = () => {
  //Google Authentication
  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });

  /*  Google AUTH  */

  var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
  let origin = "http://localhost:8000";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: `${origin}/auth/google/callback`,
      },
      function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        console.log(userProfile, "googel Authcontroller");
        return done(null, userProfile);
      }
    )
  );
};

exports.googleFunc = async (req, res) => {
  const findUserByEmail = await db.user.findAll({
    where: {
      email: userProfile.emails[0].value,
    },
  });
  let token;

  if (findUserByEmail.length > 0) {
    token = createToken(
      {
        id: findUserByEmail[0].id,
      },
      process.env.JWT_SECRET,
      process.env.COOKIE_EXPIRES_IN
    );

    return res.redirect(
      process.env.CLIENT_URL +
        `/google?username=${findUserByEmail[0].username}&&token=${token}&&email=${findUserByEmail[0].email}&&fullName=${findUserByEmail[0].fullName}&&role=${findUserByEmail[0].role}&&avatar=${findUserByEmail[0].avatar}`
    );
  } else {
    let user;
    let randomNumber = Math.floor(Math.random() * 10000);
    try {
      user = await db.user.create({
        fullName: userProfile.displayName,
        username: userProfile.name.givenName + randomNumber,
        email: userProfile.emails[0].value,
        googleId: userProfile.id,
        password: await bcrypt.hash(userProfile.id + Date.now(), 12),
        avatar: userProfile.photos[0].value,
      });
      token = createToken(
        {
          id: user.id,
        },
        process.env.JWT_SECRET,
        process.env.COOKIE_EXPIRES_IN
      );

      return res.redirect(
        process.env.CLIENT_URL +
          `/google?token=${token}&&username=${user.username}&&email=${user.email}&&fullName=${user.fullName}&&role=${user.role}&&avatar=${user.avatar}`
      );
    } catch (error) {
      console.log(error);
    }
  }
  res.cookie("token", token, {
    httpOnly: true,
  });
};
