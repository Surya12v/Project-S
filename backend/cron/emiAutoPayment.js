const mongoose = require('mongoose');
const EmiController = require('../controllers/emiController');
require('dotenv').config();
require('../config/db'); // Ensure DB connection

async function runEmiAutoPayment() {
  try {
    await EmiController.autoPayDueEmis();
    await EmiController.applyLatePenalties();
    console.log('EMI auto-payment and penalty processing done');
  } catch (err) {
    console.error('EMI auto-payment error:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Run daily at midnight via cron or manually
runEmiAutoPayment();
