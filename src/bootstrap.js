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
  .then(() => {
    return fs.statAsync(config.DB_FILE)
    .catch(() => {
      return fs.writeFileAsync(config.DB_FILE, JSON.stringify({ subscriptions: [] }, null, 4));
    });
  })
  .then(() => {
    return fs.readFileAsync(config.DB_FILE);
  })
  .then(data => {
    // setup db stores
    db.set('clients', JSON.parse(data).subscriptions || []).write();
    db.set('subscriptions', JSON.parse(data).subscriptions || []).write();
    return;
  })
  .then(() => {
    return db.get('subscriptions').forEach(timers.update).write();
  })
  .catch(err => {
    console.log(err);
    debug.log(err);
    throw Error('Bootstraping subscriptions failed');
  });
};
