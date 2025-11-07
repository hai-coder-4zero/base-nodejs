import mysql from "mysql2";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } from "./env.js";

// Create connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

const connectDB = async () => {
  try {
    await promisePool.execute("SELECT 1");
    console.log("✅ MySQL connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export { pool, promisePool, connectDB };
