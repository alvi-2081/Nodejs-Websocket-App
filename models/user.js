const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    default: 'offline'
  },
  lastActive: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('User', UserSchema);