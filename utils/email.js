const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //1.create a transporter
  const transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
      //activate less secure app option in gmail
    }
  });
  //2.Define email options
  const mailOptions = {
    from: 'jonas Schedmaann <hell0o@jonas.io>',
    to: options.email,
    subject: options.Subject,
    text: options.message
  };
  //   3.actually send email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
