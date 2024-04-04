const db = require("../../model");
const teamJoiningSendMail = require("../../services/teamJoiningSendMail");
const { createToken, verifyToken } = require("../../utils/tokenManager");
const { sendNotification } = require("../notification/notificationController");
const TeamPlayers = db.teamPlayers;
const Teams = db.teams;
const User = db.user;

// send team joining request to the team leader from user
exports.sendTeamJoinRequest = async (req, res, next) => {
  const teamId = req.params.teamId;
  const userId = req.user.id;
  try {
    // const team = await Teams.findByPk(teamId);
    const team = await Teams.findOne({
      where: {
        id: teamId,
      },
      include: {
        model: db.user,
        attributes: ["id", "username", "fullname", "email"],
      },
    });
    if (!team) {
      return res.status(404).json({ message: "Team Not Found" });
    }

    const userInTeam = await db.teamPlayers.findOne({
      where: { teamId, userId },
    });
    if (userInTeam) {
      return res
        .status(409)
        .json({ message: "User is Already in the Team!", status: 409 });
    }

    const playersInTeam = await db.teamPlayers.count({
      where: { teamId },
    });

    if (playersInTeam >= team.maxPlayers) {
      return res
        .status(400)
        .json({ message: "Team is already full", status: 400 });
    }

    const token = createToken(
      { playerUserId: userId, teamId },
      process.env.JWT_SECRET,
      process.env.TEAM_INVITATION_EXPIRES_IN
    );

    const acceptUrl = `${req.headers.origin}/accept-team-joining-request?acceptLink=${token}`;
    const user = await db.user.findByPk(userId);
    //Notification

    sendNotification(
      req.user.id,
      team.user.id,
      `${user.username} wants to Join your team ${team.teamName}`,
      acceptUrl
    );
    res.status(200).json({
      message: "Team Joining Request has been sent to the Team Leader!",
      status: "200",
    });
    // sending mail
    try {
      await teamJoiningSendMail({
        email: team.user.email,
        subject: "Team Joining Request",
        teamLeaderFullName: team.user.username,
        teamName: team.teamName,
        playerName: user.username,
        token: acceptUrl,
      });
      return;
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

// details of the player sending team joining request
exports.viewDetailsOfSendingRequestUser = async (req, res, next) => {
  const { request_token } = req.params;
  if (!request_token) {
    return res.status(400).json({ message: "Invalid Token!", status: 400 });
  }
  let decode;
  try {
    decode = verifyToken(request_token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).json({ message: error.message, status: 400 });
  }
  const { playerUserId, teamId } = decode;
  const playerUserDetails = await db.user.findByPk(playerUserId, {
    attributes: ["username", "avatar"],
  });
  if (!playerUserDetails) {
    return res.status(400).json({ message: "User Not Found!", status: 400 });
  }
  const teams = await db.teams.findByPk(teamId, {
    attributes: ["teamName", "logo"],
  });
  if (!teams) {
    return res.status(400).json({ message: "Team Not Found", status: 400 });
  }

  return res.status(200).json({ player: playerUserDetails, team: teams });
};

//Accept Team joining request by the team leader
exports.acceptTeamJoinRequest = async (req, res, next) => {
  const userId = req.user.id;
  const { request_token, notificationId } = req.body;
  // const { request_token } = req.params;
  if (!request_token) {
    return res.status(400).json({ message: "Invalid Token!", status: 400 });
  }
  let decode;
  try {
    decode = verifyToken(request_token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).json({ message: error.message, status: 400 });
  }
  const { playerUserId, teamId } = decode;
  const playerUserDetails = await db.user.findByPk(playerUserId);

  const userInTeam = await db.teamPlayers.findOne({
    where: {
      userId: playerUserId,
      teamId,
    },
  });
  const teams = await db.teams.findByPk(teamId);
  if (teams.userId != userId) {
    return res.status(400).json({
      message: "You dont have permission only team leader can join player",
      status: 400,
    });
  }

  if (userInTeam) {
    return res.status(409).json({ message: "User Already in the team!" });
  }

  const playersInTeam = await db.teamPlayers.count({
    where: { teamId },
  });

  if (playersInTeam >= teams.maxPlayers) {
    return res
      .status(400)
      .json({ message: "Team is already full", status: 400 });
  }

  const addingUserInTeam = await db.teamPlayers.create({
    userId: playerUserId,
    teamId,
  });

  sendNotification(
    userId,
    playerUserDetails.id,
    `You Joind the team ${teams.teamName}`
  );

  // await db.Notification.destroy({
  //   where: { id: notificationId },
  // });

  // await db.Notification.update(
  //   { status: "ACCEPTED" },
  //   {
  //     where: {
  //       id: notificationId,
  //     },
  //   }
  // );

  return res.status(200).json({
    message: `${playerUserDetails.username} Joined the Team `,
    addingUserInTeam,
    status: 200,
  });
};

//Reject Team joining request
exports.rejectTeamJoiningRequest = async (req, res, next) => {
  const userId = req.user.id;
  const { request_token, notificationId } = req.body;
  await db.Notification.destroy({
    where: { id: notificationId },
  });
  let decode = verifyToken(request_token, process.env.JWT_SECRET);
  const { playerUserId, teamId } = decode;
  const playerUserDetails = await db.user.findByPk(playerUserId);
  const teamDetails = await db.teams.findByPk(teamId);

  sendNotification(
    userId,
    playerUserDetails.id,
    `Your request has been rejected by admin of ${teamDetails.teamName}`
  );
  return res.json({
    message: `${playerUserDetails.username} is rejected from ${teamDetails.teamName}`,
  });
};

// display teams by userId
exports.displayPlayersTeam = async (req, res, next) => {
  const userId = req.user.id;
  const teamsOfUser = await TeamPlayers.findAll({
    where: { userId, role: "player" },
    include: [{ model: db.teams, attributes: ["id", "teamName", "logo"] }],
  });
  return res.status(200).json({ teamsOfUser });
};

//display all team members
exports.displayAllTeamMembers = async (req, res, next) => {
  const { teamId } = req.params;
  const allTeamMembers = await TeamPlayers.findAll({
    where: { teamId },
    attributes: ["role", "id"],
    include: [
      { model: db.user, attributes: ["id", "username", "fullName", "avatar"] },
    ],
  });
  return res.status(200).json({ allTeamMembers });
};

// display players details
exports.getById = async (req, res, next) => {
  const playerId = req.params.id;

  try {
    const player = await TeamPlayers.findOne({ where: { id: playerId } });
    if (!player) {
      return res.status(404).json({ message: "Player Not Found" });
    }
    const user = await User.findByPk(player.userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const playerInfo = {
      image: user.avatar,
      username: user.username,
      role: player.role,
    };
    return res.status(200).json(playerInfo);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//change leader role
exports.changeLeaderOfTeam = async (req, res, next) => {
  const userId = req.user.id;
  const teamId = req.params.teamId;
  const { newTeamLeaderUserId } = req.body;

  try {
    const player = await TeamPlayers.findOne({ where: { userId, teamId } });
    const teams = await db.teams.findByPk(teamId);

    if (!player) {
      return res
        .status(400)
        .json({ message: "You are not in the team", status: 400 });
    }
    if (!teams) {
      return res.status(400).json({ message: "No teams found", status: 400 });
    }

    if (player.role != "leader") {
      return res.status(400).json({
        message:
          "You dont have permission, Please contact to your team leader ",
        status: 400,
      });
    }
    const newTeamLeaderInTeam = await TeamPlayers.findOne({
      where: { userId: newTeamLeaderUserId, teamId },
    });
    if (!newTeamLeaderInTeam) {
      return res.status(400).json({ message: "No user in team", status: 400 });
    }
    newTeamLeaderInTeam.role = "leader";
    player.role = "player";
    newTeamLeaderInTeam.save();
    player.save();
    teams.userId = newTeamLeaderUserId;
    teams.save();

    // sending notification
    sendNotification(
      userId,
      newTeamLeaderUserId,
      `You are now leader of ${teams.teamName} team`
    );

    return res
      .status(200)
      .json({ message: "Team Leader Changed", status: 200 });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

// Delete players
exports.removePlayerFromTeam = async (req, res, next) => {
  const userId = req.user.id;
  const { playerId } = req.body;
  const teamId = req.params.teamId;

  try {
    const teams = await db.teams.findByPk(teamId);
    if (!teams) {
      return res.status(404).json({ message: "Team not found", status: 404 });
    }
    const player = await TeamPlayers.findOne({
      where: { teamId, userId: playerId },
    });
    if (!player) {
      return res.status(404).json({ message: "Player Not Found", status: 404 });
    }

    const checkTeamLeader = await TeamPlayers.findOne({
      where: { teamId, userId },
    });

    if (checkTeamLeader.role != "leader") {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this player." });
    }
    if (player.role == "leader") {
      return res.status(400).json({
        message: "You are not allowed to remove yourself",
        status: 400,
      });
    }

    //deleting player
    await player.destroy();

    //notification
    sendNotification(
      userId,
      playerId,
      `You have been removed from the ${teams.teamName} team`
    );

    return res
      .status(200)
      .json({ message: "Player deleted successfully.", status: 200 });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// leave team
exports.leaveTeam = async (req, res, next) => {
  const teamId = req.params.teamId;
  const userId = req.user.id;

  try {
    const player = await TeamPlayers.findOne({ where: { userId, teamId } });

    if (!player) {
      return res.status(404).json({ message: "player Not found" });
    }
    if (player.role == "leader") {
      return res
        .status(400)
        .json({ message: "Make Another player team leader to leave The team" });
    }

    await player.destroy();
    return res.status(200).json({ message: "You left the team", status: 200 });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.checkTeamRole = async (req, res, next) => {
  const userId = req.user.id;
  const teamId = req.params.teamId;
  if (!userId) {
    return;
  }

  const checkRole = await TeamPlayers.findOne({
    where: { userId, teamId },
    include: [
      { model: db.user, attributes: ["id", "username", "fullName", "avatar"] },
    ],
  });
  console.log(checkRole, "CHECKROLE");

  if (checkRole) {
    return res.json({ userRole: checkRole });
  }
};
