import nodemailer from 'nodemailer';
import { MAILER } from '#config';

export default nodemailer.createTransport({
  host: MAILER.HOST,
  port: MAILER.PORT,
  secure: MAILER.SECURE,
  auth: {
    user: MAILER.USER,
    pass: MAILER.PASSWORD
  }
});
