'use strict';
const { Subscription, Timer } = require('./models');
const debug = require('debug-levels')('agile-data');

module.exports = () => {
  Subscription.find({})
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
