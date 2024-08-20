import dotenv from "dotenv"
dotenv.config()

import transporter from "../Configuration/mailer.config.js";

// Function to send activation email
export const sendActivationEmail = async (user, activationToken) => {
  const activationLink = `http://localhost:5000/authenticate/activate/${activationToken}`;

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: user.email,
    subject: 'Activate Your Account',
    text: `Hello ${user.firstName},\n\nPlease activate your account by clicking the following link:\n\n${activationLink}\n\nIf you did not request this, please ignore this email.`,
    html: `<p>Hello ${user.firstName},</p>
           <p>Please activate your account by clicking the following link:</p>
           <a href="${activationLink}">Activate Your Account</a>
           <p>If you did not request this, please ignore this email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
