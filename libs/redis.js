import { createClient } from 'redis'
import { host, port, username, password } from '#config/redis.config'

export default createClient({
  socket: {
    host,
    port
  },
  username,
  password
})
