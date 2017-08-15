'use strict';
const { Subscription, Timer, Settings } = require('./models');
const debug = require('debug-levels')('agile-data');

module.exports = () => {
  Settings.find({})
  .then(s => {
    if (s.length < 1) {
      Settings.create({});
    }
  })
  .then(s => {
    return Subscription.find({});
  })
  .then(subscriptions => {
    subscriptions.forEach(sub => {
      Timer.update(sub);
    });
  })
  .catch(err => {
    debug.log(err);
    throw Error('Bootstraping subscriptions failed');
  });
};
