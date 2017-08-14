const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/agile-data');

const ClientShema = new mongoose.Schema({
  clientSecret: String,
  deviceID: String,
  userID: String,
  subscriptionID: String,
  updated_at: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// on every save, add the date
userSchema.pre('save', function (next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at) {
    this.created_at = currentDate;
  }

  next();
});

module.exports = Subscription;
