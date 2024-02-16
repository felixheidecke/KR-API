import knex from 'knex'

export default knex({
  client: 'mysql2',
  debug: process.env.NODE_ENV === 'development',
  connection: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  }
})
