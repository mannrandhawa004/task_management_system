import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({
    quiet: true
})

export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "test",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



export const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        
        // Ensure dob column exists on users table
        try {
            const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'dob'`);
            if (columns.length === 0) {
                await connection.query(`ALTER TABLE users ADD COLUMN dob DATE NULL`);
                console.log("Added dob column to users table");
            }
        } catch (e) {
            console.error("Schema check notice:", e.message);
        }

        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};