// models/Logs.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },       // ✅ must be declared
  resourceId: { type: mongoose.Schema.Types.ObjectId }, // optional but must be declared
  message: { type: String },                             // optional but must be declared
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Logs", logSchema);
