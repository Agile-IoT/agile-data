const debug = require('debug-levels')('agile-data');
const Record = require('./record');
const Client = require('./client');
const agile = require('./agile-sdk');
const TIMERS = {};

module.exports = {
  update: function updateTimer (sub) {
    this.clear(sub);
    TIMERS[sub.id] = setInterval(() => {
      debug.log('running timer job', sub.id);
      // 1. Get subscription client
      // 2. Authenticate client and get token
      // 3. Fetch data from agile API
      // 4. Save new Record
      Client.findOne({ subscription: sub.id })
        .then(client => {
          if (client) {
            return agile.idm.authentication.authenticateClient(client.name, client.clientSecret).then(function (result) {
              return result.access_token;
            });
          }
        })
        .then(token => {
          agile.tokenSet(token);
          return agile.device.lastUpdate(sub.deviceID, sub.componentID);
        })
        .then(data => {
        // clear it for safety so no other requests use token
          agile.tokenDelete();
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
    return Object.keys(TIMERS).map(k => {
      return clearInterval(TIMERS[k]);
    });
  }
};
