import mysql from 'mysql2';
import { host, user, database, password } from '#config/mysql.config';

const dbConnect = mysql.createPool({ host, user, database, password });

export default dbConnect.promise();
