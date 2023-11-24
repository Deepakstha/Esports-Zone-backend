const db = require("../../model");
const send = require("../../server");
const Notification = db.Notification;

exports.sendNotification = async (from, to, message, links) => {
  try {
    const chat = [from, to].toString();
    let data;
    if (links) {
      data = await Notification.create({
        message,
        users: chat,
        sender: from,
        receiver: to,
        links,
      });
      send.sendNotificationToUser(
        data.id,
        data.isRead,
        data.users,
        from,
        to,
        message,
        links,
        data.createdAt,
        data.updatedAt
      );
    } else {
      data = await Notification.create({
        message,
        users: chat,
        sender: from,
        receiver: to,
      });
      send.sendNotificationToUser(
        data.id,
        data.isRead,
        data.users,
        from,
        to,
        message,
        "",
        data.createdAt,
        data.updatedAt
      );
    }
  } catch (error) {
    console.log(error);
  }
};

//get All notification of user
exports.getNotificationOfUser = async (req, res, next) => {
  const userId = req.user.id;
  const notification = await Notification.findAll({
    where: { receiver: userId },
    include: [{ model: db.user, attributes: ["id", "avatar"] }],
    order: [["createdAt", "DESC"]],
  });

  await Notification.update(
    { isRead: true },
    {
      where: {
        receiver: userId,
        isRead: false,
      },
    }
  );

  return res.status(200).json({ notification });
};

exports.getUnreadNotifications = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const unreadNotifications = await Notification.count({
      where: {
        receiver: userId,
        isRead: false,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ unreadNotifications });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred" });
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  const notificationId = req.params.id;

  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await notification.update({ isRead: true });

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "An error occurred" });
  }
};
