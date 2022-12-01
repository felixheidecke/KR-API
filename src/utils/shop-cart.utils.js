// // --- Constants ---------------------------------------------------------------

// export const CART_DEFAULT_DATA = {
//   module: 0,
//   products: {},
//   total: 0
// }

// export const CART_COOKIE_NAME = 'shop3-cart-id'

// export const CART_COOKIE_CONFIG = {
//   secure: true,
//   path: '/',
//   sameSite: 'None'
// }

// // --- Functions ---------------------------------------------------------------

// import { add } from 'date-fns'

// /**
//  * Send cleared cookie
//  *
//  * @param {import('fastify').FastifyReply} response
//  */

// export const clearCartCookie = (response) => {
//   response.clearCookie(CART_COOKIE_NAME)
// }

// /**
//  * Set cart Cookie and send data
//  *
//  * @param {import('fastify').FastifyReply} response
//  * @param {any} data to send and set in cookie
//  */

// export const setCartCookie = (request, response, data) => {
//   let hostname = request.headers.origin
//     ? new URL(request.headers.origin).hostname
//     : null
//   if (hostname === 'localhost') hostname = '' // No

//   response.setCookie(CART_COOKIE_NAME, data, {
//     ...CART_COOKIE_CONFIG,
//     // expires: add(new Date(), { minutes: 60 * 3 }),
//     domain: hostname
//   })
// }
