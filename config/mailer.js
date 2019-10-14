const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Mailjet",
  auth: {
    user: process.env.TRANSPORTERLOGIN,
    pass: process.env.TRANSPORTERPASSWORD
  }
});

module.exports = transport;
