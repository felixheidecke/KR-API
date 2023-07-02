export default async function (App) {
  App.get('/ping', (_, response) => response.send('pong'))
}
