const express = require("express");

const app = express();

const userRouter = require("./routes/userRoutes/userRouter");
const gameRouter = require("./routes/gamesRoutes/gameRouter");
const tournamentRouter = require("./routes/tournamentRoutes/tournamentRouter");
const walletRouter = require("./routes/walletRoutes/walletRouter");
const prizePoolRouter = require("./routes/prizePoolRoutes/prizePoolRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/game", gameRouter);
app.use("/tournament", tournamentRouter);
app.use("/wallet", walletRouter);
app.use("/prize-pool", prizePoolRouter);

module.exports = app;
