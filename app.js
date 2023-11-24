const express = require("express");

const app = express();

const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { googleAuth } = require("./controller/googleAuthController");

//importing routes
const userRouter = require("./routes/userRoutes/userRouter");
const gameRouter = require("./routes/gamesRoutes/gameRouter");
const tournamentRouter = require("./routes/tournamentRoutes/tournamentRouter");
const walletRouter = require("./routes/walletRoutes/walletRouter");
const prizePoolRouter = require("./routes/prizePoolRoutes/prizePoolRouter");
const teamRouter = require("./routes/teamRoutes/teamRouter");
const teamPlayerRouter = require("./routes/teamRoutes/teamPlayerRouter");

const corsOption = {
  origin: origin,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//expression session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// passport js for googleAuthentication
app.use(passport.initialize());
app.use(passport.session());
googleAuth();

//GoogleAuth Routes
const googleAuthRouter = require("./routes/userRoutes/googleAuthRouter");
app.use("/auth", googleAuthRouter);

// uploads
app.use("/uploads", express.static("uploads"));

//Routes
app.use("/user", userRouter);
app.use("/game", gameRouter);
app.use("/tournament", tournamentRouter);
app.use("/wallet", walletRouter);
app.use("/prize-pool", prizePoolRouter);
app.use("/team", teamRouter);
app.use("/team-player", teamPlayerRouter);

app.use("*", (req, res) => {
  return res.status(404).json({ message: "Route Not Found", status: 404 });
});
module.exports = app;
