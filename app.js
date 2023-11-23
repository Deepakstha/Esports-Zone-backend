const express = require("express");

const app = express();

const userRouter = require("./routes/userRoutes/userRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);

module.exports = app;
