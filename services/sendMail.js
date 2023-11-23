const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const accountActivationMail = async ({ email, subject, fullname, token }) => {
  const mailOption = {
    from: `Esports zone <${process.env.SMTP_MAIL}>`,
    to: email,
    subject,
    html: `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #f3f3f3;">
      <tr>
        <td align="center" style="padding: 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
            <tr>
              <td align="center" style="padding: 40px;">
                <h1 style="color: #333333; margin: 0;">Verify Your Email</h1>
                <p style="color: #777777; margin: 20px 0;">Hi, ${fullname},</p>
                <p style="color: #777777; margin: 20px 0;">In order to complete your registration, please click the button below to verify your email:</p>
                <a href="${token}" style="display: inline-block; padding: 10px 20px; background-color: #FF8F40; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
  };
  await transporter.sendMail(mailOption);
};

module.exports = { accountActivationMail };
