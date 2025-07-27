/**
 * EMI Auto-Payment & Penalty Scheduler
 * Run this script daily (e.g., via cron) to:
 *  - Auto-pay due EMIs for users with autoPaymentMethod set
 *  - Mark overdue EMIs as LATE and apply penalties
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('../config/db'); // Ensure DB connection

const emiController = require('../controllers/emiController');

async function runScheduler() {
  try {
    console.log(`[${new Date().toISOString()}] Starting EMI scheduler...`);
    await emiController.autoPayDueEmis();
    await emiController.applyLatePenalties();
    console.log(`[${new Date().toISOString()}] EMI scheduler completed successfully.`);
  } catch (err) {
    console.error('EMI scheduler error:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Run immediately if called directly
if (require.main === module) {
  runScheduler();
}

module.exports = runScheduler;
