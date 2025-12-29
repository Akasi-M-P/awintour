const Nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // CREATE A TRANSPORTER
  const transporter = Nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // DEFINE THE EMAIL OPTIONS
  const mailOptions = {
    from: "Peter Mba Akasi <awintechworld@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // SEND EMAIL
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
