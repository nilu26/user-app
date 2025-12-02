import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Create a connection pool for efficient database handling
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

// Simple query execution function
const query = (text: string, params: any[] = []) => {
  return pool.query(text, params);
};

// Check connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err.stack);
  } else {
    console.log("Successfully connected to PostgreSQL at:", res.rows[0].now);
  }
});

export default query;
