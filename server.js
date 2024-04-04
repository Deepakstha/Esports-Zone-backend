const app = require("./app");
require("dotenv").config();
const socket = require("socket.io");

const expressServer = app.listen(process.env.PORT, () => {
  console.log("Server is Running on port:", process.env.PORT);
});

const io = socket(expressServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  exports.sendNotificationToUser = async (
    id,
    isRead,
    users,
    senderUserId,
    recipientUserId,
    message,
    link,
    createdAt,
    updatedAt
  ) => {
    const senderSocketId = onlineUsers.get(recipientUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("send-notification", {
        id,
        isRead,
        users,
        sender: senderUserId,
        receiver: recipientUserId,
        message: message,
        links: link,
        createdAt,
        updatedAt,
      });
    }
  };
});
