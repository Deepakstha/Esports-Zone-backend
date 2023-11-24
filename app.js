const express = require("express");

const app = express();

const userRouter = require("./routes/userRoutes/userRouter");
const gameRouter = require("./routes/gamesRoutes/gameRouter");
const tournamentRouter = require("./routes/tournamentRoutes/tournamentRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/game", gameRouter);
app.use("/tournament", tournamentRouter);

module.exports = app;
