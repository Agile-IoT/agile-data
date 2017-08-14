const _ = require('lodash');
const config = require('../config');
const debug = require('debug-levels')('agile-data');
const Record = require('./record');
const TIMERS = {};

module.exports = {
  update: function updateTimer (sub) {
    this.clear(sub)
    return TIMERS[sub.id] = setInterval(() => {
      debug.log('running timer job', sub.id);
      const agile = require('agile-sdk')({
        api: config.AGILE_API,
        idm: config.AGILE_IDM
      });

      const client = null;

      return Promise.resolve(client)
      .then(client => {
        if (client) {
          return;
          return agile.idm.authentication.authenticateClient(client.name, client.clientSecret).then(function (result) {
            return result.access_token;
          })
        } else {
          return;
        }
      })
      .then(token => {
        // TODO allow the sdk to load a token after the fact.
        return require('agile-sdk')({
          api: config.AGILE_API,
          idm: config.AGILE_IDM,
          token: token
        });
      })
      .then(sdk => {
        return sdk.device.lastUpdate(sub.deviceID, sub.componentID)
      })
      .then(data => {
        debug.log('Data from agile-api', data);
        data.subscriptionId = sub.id
        return Record.create(data)
      })
      .then(() => {
        console.log('saved to db', Date.now());
      })
      .catch(err => {
        console.log(err);
      });
    }, sub.interval || config.INTERVAL_DEFAULT);
  },
  clear: function clearTimer (sub) {
    return clearInterval(TIMERS[sub.id])
  }
};
