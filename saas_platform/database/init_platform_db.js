import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(path.join(__dirname, "../../server/package.json"));
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.join(__dirname, "../../server/.env"), quiet: true });

async function initPlatformDb() {
  console.log("Connecting to MySQL server to initialize saas_platform_db...");
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    const sqlPath = path.join(__dirname, "platform_schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Executing platform_schema.sql...");
    await connection.query(sql);
    console.log("✅ saas_platform_db and subscription_plans successfully initialized!");

    await connection.end();
  } catch (error) {
    console.error("❌ Failed to initialize saas_platform_db:", error.message);
    process.exit(1);
  }
}

initPlatformDb();
