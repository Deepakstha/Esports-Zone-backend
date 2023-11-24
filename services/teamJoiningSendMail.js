const nodemailer = require("nodemailer");

const teamJoiningSendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Esports zone <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `
    <center>
      <div style="background-color:#DFE7F1; padding:50px; ">
        <div style=" background-color:#fff; width:400px; padding:50px; border-radius:10px;">
          <h1>Team Joining Request</h1>
          <p>Hi, ${options.teamLeaderFullName} </p> 
          <p> ${options.playerName} wants to join your team ${options.teamName} </p>
          <a href="${options.token}" style="color: #fff; background-color:#FF8F40; padding:10px 15px; border-radius:40px">Accept</a>
        </div>
      </div>
    </center>
  `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = teamJoiningSendMail;
