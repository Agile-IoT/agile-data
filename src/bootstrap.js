'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const _ = require('lodash');
const Timer = require('./models/timer');
const Subscription = require('./models/subscription')
const config = require('./config');
const debug = require('debug-levels')('agile-data');

module.exports = () => {
  Subscription.find({})
  .then(subscriptions => {
    subscriptions.forEach(sub => {
      Timer.update(sub);
    })
  })
  .catch(err => {
    console.log(err);
    debug.log(err);
    throw Error('Bootstraping subscriptions failed');
  });
};
