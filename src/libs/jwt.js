import { secret } from '#config/app'
import jwt from 'jsonwebtoken'

export const sign = (object) => {
  return jwt.sign(object, secret)
}

export const verify = (token) => {
  try {
    return jwt.verify(token, secret)
  } catch (e) {
    throw e
  }
}
