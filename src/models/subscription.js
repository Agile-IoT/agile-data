const mongoose = require('mongoose');
const Timer = require('./timer');
mongoose.connect('mongodb://localhost/agile-data');

const SubscriptionSchema = new mongoose.Schema({
  componentID: { type: String, required: true },
  deviceID: { type: String, required: true },
  userID: String,
  clientID: String,
  interval: Number,
  updated_at: { type: Date, default: Date.now },
});

// on every save,
// add created_at
// add interval timer
SubscriptionSchema.pre('save', function (next) {
  if (!this.created_at) {
    var currentDate = new Date();
    this.created_at = currentDate;
  }
  try {
    Timer.update(this);
  } catch (e) {
    next(e);
  }
  next();
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
