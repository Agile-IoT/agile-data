const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/agile-data');

const SettingsSchema = new mongoose.Schema({
  retention: { type: String, default: '7d' },
  updated_at: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;
