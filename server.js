const app = require("./app");
require("dotenv").config();

const expressServer = app.listen(process.env.PORT, () => {
  console.log("Server is Running on port:", process.env.PORT);
});
