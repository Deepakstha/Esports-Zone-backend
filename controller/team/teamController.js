const db = require("../../model");
const fs = require("fs");
const { createToken, verifyToken } = require("../../utils/tokenManager");
const { sendNotification } = require("../notification/notificationController");
const Teams = db.teams;
const TeamPlayers = db.teamPlayers;

exports.createTeams = async (req, res, next) => {
  const userId = req.user.id;
  const { teamName, maxPlayers } = req.body;

  if (!teamName) {
    return res.status(400).json({
      message: "Team Name Required.",
      status: 400,
    });
  }
  if (!maxPlayers) {
    return res
      .status(400)
      .json({ message: "Please Insert maximum players in the team" });
  }
  if (!req.file) {
    return res.status(400).json({
      message: "Please Insert team logo.",
      status: 400,
    });
  }
  try {
    const teamNames = await Teams.findOne({ where: { teamName: teamName } });
    if (teamNames) {
      res
        .status(409)
        .json({ message: "Team name Already Exists ", status: 409 });
    } else {
      const filename = req.file.filename;

      const filePath = `uploads/teamsLogo/${filename}`;

      const slugField = teamName
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      const createTeams = await Teams.create({
        teamName,
        logo: filePath,
        maxPlayers: maxPlayers,
        userId: userId,
        slug: slugField,
      });
      if (createTeams) {
        const teamId = createTeams.id;
        console.log(teamId);
        await TeamPlayers.create({
          userId: userId,
          teamId: teamId,
          role: "leader",
        });

        return res.status(200).json({
          message: "Team created successfully.",
          status: 200,
          createTeams,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    next(error);
  }
};

//display teams by user id (leader)
exports.displayTeamsByUserId = async (req, res, next) => {
  const userId = req.user.id;
  const teamsByUser = await Teams.findAll({ where: { userId } });
  return res.json({ teams: teamsByUser });
};

// get teams by id
exports.getById = async (req, res, next) => {
  const teamId = req.params.id;

  try {
    const teams = await Teams.findOne({
      where: { id: teamId },
      include: { model: db.user, attributes: ["username", "fullname"] },
    });

    if (!teams) {
      return res.status(404).json({ message: "Teams Not Found", status: 404 });
    }
    return res.status(200).json({ teams, status: 200 });
  } catch (error) {
    next(error);
  }
};

// Delete team
exports.deleteById = async (req, res, next) => {
  const teamId = req.params.id;
  let userId;
  const role = req.user.role;

  if (role === "admin") {
    userId = req.body.userId;
  } else {
    userId = req.user.id;
  }

  try {
    const teamPlayers = await db.teamPlayers.findAll({ where: { teamId } });
    const team = await Teams.findOne({
      where: { id: teamId },
    });
    if (!team) {
      res.status(404).json({ message: "Team Doesn't Exist", status: 404 });
    }

    const filterLeader = teamPlayers.filter((data) => data.role != "player");
    if (filterLeader[0].userId == userId) {
      let keys;
      if (team.logo != null) {
        keys = team.logo.split("/").pop();
      }
      const deleteTeam = await team.destroy();

      return res
        .status(200)
        .json({ message: "team Deleted", filterLeader, status: 200 });
    } else {
      return res.status(400).json({
        message: "Only team leader has permission to delete Team",
        status: 400,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// display top ten squad
exports.displayTopTenSquad = async (req, res) => {
  const displayTopSquad = await Teams.findAll({
    attributes: ["id", "teamName", "logo", "wins"],
    order: [["wins", "DESC"]],
    limit: 10,
  });
  return res.status(200).json(displayTopSquad);
};

// Update Team
exports.updateById = async (req, res, next) => {
  const userId = req.user.id;
  const teamId = req.params.id;
  const { teamName } = req.body;

  if (!teamName) {
    return res.status(400).json({
      message: "Team name is empty",
    });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Please Insert team logo" });
  }

  try {
    let team = await Teams.findOne({ where: { id: teamId } });
    if (!team) {
      res.status(404).json({ message: "Team Not Found " });
    } else if ((team.role = "leader")) {
      //   const keys = team.logo.split("/").pop(); // taking image name

      //   deleteFromS3(keys); // deleting image from the s3 bucket

      //   // uploading new image into s3 bucket
      //   await uploadToS3(req.file)
      //     .then((result) => {
      //       filePath = result.Location;
      //     })
      //     .catch((error) => {
      //       console.log(error.message);
      //     });
      const filename = req.file.filename;

      const filePath = `uploads/teamsLogo/${filename}`;

      team.teamName = teamName;
      team.logo = filePath;
      team.userId = userId;

      // Corrected line: Call the save method on the team instance
      await team.save();

      return res
        .status(200)
        .json({ message: "Team updated Successfully", updatedTeam: team });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//get all teams
exports.getAllTeams = async (req, res, next) => {
  try {
    const allTeams = await Teams.findAll({
      include: { model: db.user, attributes: ["username", "fullname"] },
    });

    if (allTeams.length === 0) {
      res.status(400).json({ message: "No Teams Available !!!" });
    } else {
      return res
        .status(200)
        .json({ message: "List of Available Teams", allTeams });
    }
  } catch (error) {
    console.error("Error:", error.message);
    next(error);
  }
};

// Invitation links
exports.inviteLinks = async (req, res, next) => {
  const teamId = req.params.id;
  const userId = req.user.id;
  const team = await Teams.findByPk(teamId);
  if (!team) {
    return res.status(404).json({ message: "Teams Not found" });
  }
  if (team.userId != userId) {
    return res
      .status(401)
      .json({ message: "You donot have permission", status: 401 });
  }
  const token = createToken(
    { teamId },
    process.env.JWT_SECRET,
    process.env.TEAM_INVITATION_EXPIRES_IN
  );

  const teamInvitationLink = `${req.headers.origin}/squad/${team.id}?invitation=${token}`;
  return res.status(200).json({ teamInvitationLink });
};

// Team Joining Links
exports.teamJoiningWithInviteLinks = async (req, res, next) => {
  // const { joining_token } = req.body;
  const { joining_token } = req.params;
  const userId = req.user.id;
  if (!joining_token) {
    return res.status(400).json({ message: "Invalid Token!", status: 400 });
  }
  const user = await db.user.findByPk(userId);
  let decode;
  try {
    decode = verifyToken(joining_token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).json({ message: error.message, status: 400 });
  }
  const { teamId } = decode;
  const team = await db.teams.findByPk(teamId);
  const userInTeam = await db.teamPlayers.findOne({
    where: { teamId, userId },
  });
  if (userInTeam) {
    return res.status(409).json({ message: "User Already in the team!" });
  }
  const playersInTeam = await db.teamPlayers.count({
    where: { teamId },
  });

  if (playersInTeam >= team.maxPlayers) {
    return res
      .status(400)
      .json({ message: "Team is already full", status: 400 });
  }
  const addingUserInTeam = await db.teamPlayers.create({ userId, teamId });

  console.log(
    userId,
    team.userId,
    `${user.username} Joind your team ${team.teamName}`
  );
  sendNotification(
    userId,
    team.userId,
    `${user.username} Joind your team ${team.teamName}`
  );
  return res.status(200).json({
    message: `You Joined the Team ${team.teamName}`,
    addingUserInTeam,
  });
};
