/**
 * MongoDB Connection Configuration
 * 
 * Manages database connection using Mongoose:
 * - Establishes connection to MongoDB
 * - Handles connection errors
 * - Provides connection status logging
 * 
 * Uses environment variables for database configuration:
 * - MONGODB_URI: Connection string
 * - Database name is set to "OAuth-App"
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "OAuth-App",
    });
    console.log("✅ MongoDB connected");
    console.log("📂 Database:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
