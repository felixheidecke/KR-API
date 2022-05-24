import mysql from 'mysql2';
import { DB } from '#config';

const dbConnect = mysql.createPool({
  host: DB.HOST,
  user: DB.USER,
  database: DB.DATABASE,
  password: DB.PASSWORD
});

export default dbConnect.promise();
