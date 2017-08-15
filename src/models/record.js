const mongoose = require('mongoose');
const ms = require('ms');
const QueryPlugin = require('mongoose-query');
mongoose.connect('mongodb://localhost/agile-data');

const recordSchema = new mongoose.Schema({
  componentID: { type: String, required: true },
  deviceID: { type: String, required: true },
  value: String,
  unit: String,
  format: String,
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  lastUpdate: Date
});

recordSchema.plugin(QueryPlugin);

recordSchema.pre('save', function (next) {
  mongoose.models.Subscription
    .findOne({ _id: this.subscription })
    .exec()
    .then(subscription => {
      if (!this.createdAt) {
        this.createdAt = Date.now();
      }
      if (!this.expireAt && subscription) {
        this.expireAt = Date.now() + ms(subscription.retention);
      }

      next();
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
