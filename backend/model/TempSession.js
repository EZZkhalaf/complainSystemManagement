// models/TempResetSession.js
const mongoose = require('mongoose');

const tempResetSessionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  valid: { type: Boolean, default: true },
  createdAt: { type: Date, expires: 600, default: Date.now } // auto expires in 10 mins
});

module.exports = mongoose.model('TempSession', tempResetSessionSchema);
