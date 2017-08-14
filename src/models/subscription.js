const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/agile-data');
const Timer = require('./timer');

const SubscriptionSchema = new mongoose.Schema({
  componentID: { type: String, required: true },
  deviceID: { type: String, required: true },
  userID: String,
  clientID: String,
  interval: { type: Number, default: 9000 },
  retention: { type: String },
  updated_at: { type: Date, default: Date.now },
});

// on every save,
// add created_at
// add retention setting if no set directly
// add interval timer
SubscriptionSchema.pre('save', function (next) {
  mongoose.models.Settings.findOne({}).then(settings => {
    if (!this.created_at) {
      var currentDate = new Date();
      this.created_at = currentDate;
    }
    if (!this.retention) {
      this.retention = settings.retention;
    }
    try {
      Timer.update(this);
    } catch (e) {
      next(e);
    }
    next();
  })
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
