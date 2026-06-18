import mysql from "mysql2/promise";
import { envVars } from "./env";

export const db = mysql.createPool({
  host: envVars.DB_HOST,
  port: Number(envVars.DB_PORT),
  user: envVars.DB_USER,
  password: envVars.DB_PASSWORD || "",
  database: envVars.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});