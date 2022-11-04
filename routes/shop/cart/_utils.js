import { verify } from '#libs/jwt'
import { add } from 'date-fns'

export const cookieName = 'Shop3Cart'

export const cookieOptions = () => {
  return {
    expires: add(new Date(), { minutes: 30 }),
    secure: true
  }
}

export const cookiePreHandler = async (request) => {
  const cookie = request.cookies[cookieName]
  request.cart = cookie
    ? verify(cookie)
    : {
        products: {},
        total: 0
      }
}
