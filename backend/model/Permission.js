const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  description: { type: String }, // optional, for admin UI
});

module.exports = mongoose.model('Permission', permissionSchema);
