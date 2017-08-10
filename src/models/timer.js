const _ = require('lodash');
const influx = require('./influxdb');
const config = require('../config');
const debug = require('debug-levels')('agile-data');
const db = require('./db');
const TIMERS = {};

function generateTimerId (sub) {
  return `${sub.deviceID}-${sub.componentID}-${sub.user && sub.user.id}`;
}

function getTimer (sub) {
  return TIMERS[generateTimerId(sub)];
}

module.exports = {
  update: function updateTimer (sub) {
    console.log(sub)
    TIMERS[generateTimerId(sub)] = setInterval(() => {

      const client = db.get('clients').find({ id: sub.client });
      const agile = require('agile-sdk')({
        api: config.AGILE_API,
        idm: config.AGILE_IDM,
        token: '0Q0h2IDk4AtZ61dU5RRdSi9yUINErN5rMIxLFJ3MlrBT830ARYfKOaiBlIRJG7CY'
      });

      return Promise.resolve(client)
      .then(client => {
        if (client) {
          return;
          return agile.idm.authentication.authenticateClient(client.name, client.clientSecret).then(function (result) {
            console.log('yassss')
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
        const tags = [ 'deviceID', 'componentID' ];
        return influx.writePoints([
          {
            measurement: 'records',
            tags: _.assign(_.pick(sub, tags), { userID: sub.user && sub.user.id }),
            fields: _.omit(data, tags.concat('user'))
          }
        ]);
      })
      .then(() => {
        console.log('saved to db');
      })
      .catch(err => {
        console.log(err);
      });
    }, sub.interval || config.INTERVAL_DEFAULT);

    return sub;
  },
  get: getTimer,
  clear: function clearTimer (sub) {
    clearInterval(getTimer(sub));
    return sub;
  }
};
