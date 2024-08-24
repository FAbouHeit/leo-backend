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

export const sendPasswordChangedEmail = async (user) => {

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: user.email,
    subject: 'Account Password Changed.',
    text: `Hello ${user.firstName},\n\nThis is to notify you regarding the recent password change on your account.\n\nIf you did not request this, please notify us immediately.`,
    html: `<p>Hello ${user.firstName},</p>
           <p>This is to notify you regarding the recent password change on your account.</p>
           <p>If you did not request this, please notify us immediately.</p>`,
  };

  await transporter.sendMail(mailOptions);
};


export const send2FACode = async (user, twoFactorAuthorizationCode) => {
  const code = twoFactorAuthorizationCode;

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: user.email,
    subject: 'Verification Code',
    text: `Hello ${user.firstName},\n\nWe have detected a new login attempt on your account. Since we don't recognize your device, please enter the following code when prompted.\n\n\n${code}\n\n\nIf you have received multiple codes, make sure to use the most recent one.\n\nPlease DO NOT share this code with ANYONE.\n\nIf that wasn't you please contact support as soon as possible.\n\nWe also strongly advise you to change your password from a device you have used to login in the past.`,
    html: `<p>Hello ${user.firstName},</p>
           <p>We have detected a new login attempt on your account. Since we don't recognize your device, please enter the following code when prompted.</p>
           <p>${code}</p>
           <p>If you have received multiple codes, make sure to use the most recent one.</p>
           <p>Please DO NOT share this code with ANYONE.</p>
           <p>If that wasn't you please contact support as soon as possible.</p>
           <p>We also strongly advise you to change your password from a device you have used to login in the past.</p>`,
  };

  await transporter.sendMail(mailOptions);
};