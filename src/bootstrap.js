'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const _ = require('lodash');
const influx = require('./models/influxdb');
const db = require('./models/db');
const timers = require('./models/timer');
const config = require('./config');
const debug = require('debug-levels')('agile-data');

module.exports = () => {
  return influx.getDatabaseNames()
  .then(names => {
    if (!names.includes(config.DB_NAME)) {
      return influx.createDatabase(config.DB_NAME);
    }
  })
  .then(() => {
    return influx.showRetentionPolicies();
  })
  .then((policies) => {
    if (!_.find(policies, { name: config.DB_RP_NAME })) {
      return influx.createRetentionPolicy(config.DB_RP_NAME, {
        database: config.DB_NAME,
        duration: config.DB_RP_DURATION,
        replication: 1,
        isDefault: true
      });
    }
  })
  .catch(err => {
    console.log(err);
    debug.log(err);
    throw Error('Bootstraping subscriptions failed');
  });
};
