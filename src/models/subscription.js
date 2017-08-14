const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/agile-data');
const Timer = require('./timer');

const SubscriptionSchema = new mongoose.Schema({
  componentID: { type: String, required: true },
  deviceID: { type: String, required: true },
  userID: String,
  clientID: String,
  interval: { type: Number, default: 9000 },
  updated_at: { type: Date, default: Date.now },
  // default one week retention
  retention: { type: String, default: '7d' }
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

SubscriptionSchema.methods.clearTimer = function () {
  try {
    Timer.clear(this);
  } catch (e) {
    throw (e);
  }
  return this;
};

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
