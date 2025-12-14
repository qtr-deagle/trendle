import fs from "fs";
import path from "path";
import pool from "../config/database.js";

export const runMigrations = async () => {
  try {
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by ; to get individual queries
    const queries = schema.split(";").filter((q) => q.trim());

    const connection = await pool.getConnection();

    for (const query of queries) {
      if (query.trim()) {
        try {
          await connection.execute(query);
          console.log("✓ Executed:", query.substring(0, 50) + "...");
        } catch (error) {
          console.error("Migration error:", error.message);
        }
      }
    }

    connection.release();
    console.log("✅ Database migrations completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};
