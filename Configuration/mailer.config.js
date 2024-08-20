import nodemailer from 'nodemailer';
import dotenv from "dotenv"
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    }
  });
  
export default transporter;