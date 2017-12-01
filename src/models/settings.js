const mongoose = require('./mongoose');

const SettingsSchema = new mongoose.Schema({
  retention: { type: String, default: '7d' },
  updated_at: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;
