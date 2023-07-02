import { secret } from '#config/app.config'
import jwt from 'jsonwebtoken'

export const sign = (object, config = {}) => {
  return jwt.sign(object, secret, config)
}

export const verify = (token) => {
  try {
    return jwt.verify(token, secret)
  } catch (e) {
    console.error(e)
    return false
  }
}
