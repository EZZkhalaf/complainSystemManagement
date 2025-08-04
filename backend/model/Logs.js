// models/Logs.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },       
  resourceId: { type: mongoose.Schema.Types.ObjectId }, 
  message: { type: String },                            
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Logs", logSchema);
