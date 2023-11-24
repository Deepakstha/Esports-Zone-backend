const express = require("express");

const app = express();

const userRouter = require("./routes/userRoutes/userRouter");
const gameRouter = require("./routes/gamesRoutes/gameRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/game", gameRouter);

module.exports = app;
