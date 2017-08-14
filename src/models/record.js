const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/agile-data');

const recordSchema = new mongoose.Schema({
  componentID: { type: String, required: true },
  deviceID: { type: String, required: true },
  value: String,
  unit: String,
  format: String,
  lastUpdate: { type: Date },
});

// on every save,
// add created_at
// add interval timer
// SubscriptionSchema.pre('save', function (next) {
//   if (!this.created_at) {
//     var currentDate = new Date();
//     this.created_at = currentDate;
//   }
//   try {
//     Timer.update(this);
//   } catch (e) {
//     next(e);
//   }
//   next();
// });

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
