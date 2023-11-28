import nodemailer from 'nodemailer'
import {
  host,
  port,
  requireTLS,
  user,
  password
} from '#config/nodemailer.config'

export const transportConfig = {
  host,
  port,
  requireTLS,
  auth: {
    user,
    pass: password
  }
}

export const createTransport = nodemailer.createTransport
