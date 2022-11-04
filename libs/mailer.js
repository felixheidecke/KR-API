import nodemailer from 'nodemailer'
import { host, port, secure, user, password } from '#config/nodemailer'

export default nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass: password
  }
})
