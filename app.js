const express = require("express");

const app = express();

const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const {
  googleAuth,
} = require("./controller/userController/googleAuthController");
const accessController = require("./middleware/accessControl");

//importing routes
const userRouter = require("./routes/userRoutes/userRouter");
const gameRouter = require("./routes/gamesRoutes/gameRouter");
const tournamentRouter = require("./routes/tournamentRoutes/tournamentRouter");
const walletRouter = require("./routes/walletRoutes/walletRouter");
const prizePoolRouter = require("./routes/prizePoolRoutes/prizePoolRouter");
const timeSlotRouter = require("./routes/timeSlotsRoutes/timeSlotsRouter");
const teamRouter = require("./routes/teamRoutes/teamRouter");
const teamPlayerRouter = require("./routes/teamRoutes/teamPlayerRouter");
const notificationRouter = require("./routes/notificationRoutes/notificationRouter");
const tournamentRegistration = require("./routes/tournamentRoutes/tournamentRegistrationRouter");
const leaderBoardRouter = require("./routes/leaderBoardRoutes/leaderBoardRouter");
const tournamentResultRouter = require("./routes/tournamentRoutes/tournamentResultRouter");
const ingameIdRouter = require("./routes/ingameIDRoutes/inGameIDRouter");
const topupRouter = require("./routes/topupRoutes/topupRouter");

const origin = ["http://localhost:5173", "http://127.0.0.1:5173"];
const corsOption = {
  origin: origin,
  optionsSuccessStatus: 200,
};
app.use(accessController);
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
app.use("/time-slot", timeSlotRouter);
app.use("/team", teamRouter);
app.use("/team-players", teamPlayerRouter);
app.use("/notification", notificationRouter);
app.use("/tournament-registration", tournamentRegistration);
app.use("/leader-board", leaderBoardRouter);
app.use("/tournament-result", tournamentResultRouter);
app.use("/in-game-id", ingameIdRouter);
app.use("/topup", topupRouter);

app.use("*", (req, res) => {
  return res.status(404).json({ message: "Route Not Found", status: 404 });
});
module.exports = app;
