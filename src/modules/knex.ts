import knex from 'knex'
import { toMilliseconds } from '../common/utils/convert-time.js'

export function useKnex(config = {}) {
  return knex({
    client: 'mysql2',
    debug: process.env.NODE_ENV === 'development',
    acquireConnectionTimeout: toMilliseconds({ seconds: 5 }),
    connection: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    },
    pool: { min: 2, max: 8 },
    ...config
  })
}

export default useKnex()
