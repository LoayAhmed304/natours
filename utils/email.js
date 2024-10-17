const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: '587',
    auth: {
      user: 'e7ad1b7d3dad46',
      pass: '2d4eb509d12024',
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Loay Ahmed <loayahmed304@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
