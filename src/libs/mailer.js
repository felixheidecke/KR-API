import nodemailer from 'nodemailer'
import { host, port, requireTLS, user, password } from '#config/nodemailer'

const config = {
  host,
  port,
  requireTLS,
  auth: {
    user,
    pass: password
  }
}

export default nodemailer.createTransport(config)
