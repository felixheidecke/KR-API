import nodemailer from 'nodemailer'
import { host, port, secure, user, password } from '#config/nodemailer.config'

export default nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass: password
  }
})
