/**
 * Server entry point
 * 
 * This file is responsible for:
 * - Loading environment variables
 * - Initializing the Express application
 * - Connecting to MongoDB database
 * - Starting the HTTP server
 * 
 * The server listens on the specified PORT environment variable
 * or defaults to port 5000.
 */

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
