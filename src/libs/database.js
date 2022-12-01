import mysql from 'mysql2'
import { host, user, database, password } from '#config/mysql'

const dbConnect = mysql.createPool({ host, user, database, password })

export default dbConnect.promise()
