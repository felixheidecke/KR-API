/**
 * Ping route
 * @param {Object} App Fastify instance object
 * @returns {Promise<void>}
 */
export default (App) => App.get('/ping', (_, response) => response.send('pong'))
