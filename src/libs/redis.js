import { createClient } from 'redis'
import { host, port, username, password } from '#config/redis.config'

const client = createClient({
  socket: {
    host,
    port
  },
  username,
  password
})

client.connect()

export default client
