import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const databaseUrl = process.env.DB_URL;

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DB_URL");
}

const db = mysql.createPool(databaseUrl);

export const connectDatabase = async () => {
  const connection = await db.getConnection();
  try {
    await connection.ping();
    console.log("MySQL connected successfully.");
  } finally {
    connection.release();
  }
};

export default db;
