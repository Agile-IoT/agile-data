const config = require('../config');
const debug = require('debug-levels')('agile-data');
const Record = require('./record');
const TIMERS = {};

module.exports = {
  update: function updateTimer (sub) {
    this.clear(sub);
    TIMERS[sub.id] = setInterval(() => {
      debug.log('running timer job', sub.id);
      const agile = require('agile-sdk')({
        api: config.AGILE_API,
        idm: config.AGILE_IDM
      });

      const client = null;

      return Promise.resolve(client)
      .then(client => {
        if (client) {
          return agile.idm.authentication.authenticateClient(client.name, client.clientSecret).then(function (result) {
            return result.access_token;
          });
        } else {

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
        return sdk.device.lastUpdate(sub.deviceID, sub.componentID);
      })
      .then(data => {
        debug.log('Data from agile-api', data);
        data.subscription = sub.id;
        return Record.create(data);
      })
      .then(() => {
        console.log('saved to db', Date.now());
      })
      .catch(err => {
        console.log(err);
      });
    }, sub.interval);

    return TIMERS[sub.id];
  },
  clear: function clearTimer (sub) {
    return clearInterval(TIMERS[sub.id]);
  },
  clearAll: function () {
    Object.keys(TIMERS).foreach(k => {
      return clearInterval(TIMERS[k])
    })
  }
};
