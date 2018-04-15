/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
const randomToken = require('rand-token');
const config = require('../config');
const mongoose = require('./mongoose');
const Timer = require('./timer');
const agile = require('./agile-sdk');

const SubscriptionSchema = new mongoose.Schema({
  componentID: { type: String, required: true },
  deviceID: { type: String, required: true },
  userID: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  interval: { type: Number, default: 9000 },
  retention: { type: String },
  updated_at: { type: Date, default: Date.now },
  token: { type: String },
  encrypt: {
    key: {
      type: String
    },
    fields: {
      type: Array
    }
  }
});

// this is more complex than it needs to be because we are allowing
// both authenticated and unauthed requests to create subs.
// on every save:
// add created_at
// add retention setting from global settings if not set directly
// if req.token is present create a Client associated with subscription
// add interval timer to run jobs
// remove token and save.
SubscriptionSchema.pre('save', function (next) {
  mongoose.models.Settings.findOne({}).then(settings => {
    if (!this.created_at) {
      var currentDate = new Date();
      this.created_at = currentDate;
    }
    if (!this.retention) {
      this.retention = settings.retention;
    }
    return settings;
  })
    .then(() => {
      if (this.token) {
        agile.tokenSet(this.token);

        return agile.idm.entity.create(`agile-data-${this._id}`, 'client', {
          name: `agile-data-${this._id}`,
          clientSecret: randomToken.generate(16),
          redirectURI: `${config.AGILE_IDM}/auth/${this._id}/callback`
        }).then((client) => {
          return mongoose.models.Client.create(Object.assign(client, {
            subscription: this.id
          }));
        })
          .catch(err => {
            next(err);
          });
      }
      // if no token don't create client
    })
    .then(() => {
      if (this.token) {
        agile.tokenSet(this.token);

        // set user info on subscription
        return agile.idm.user.getCurrentUserInfo().then((info) => {
          this.userID = info.id;
        });
      }
    })
    .then(() => {
      agile.tokenDelete();
      this.token = undefined;
      try {
        Timer.update(this);
      } catch (e) {
        next(e);
      }
      // always remove token before save
      next();
    })
    .catch(err => {
      next(err);
    });
});

SubscriptionSchema.methods.clearTimer = function () {
  try {
    Timer.clear(this);
  } catch (e) {
    throw (e);
  }
  return this;
};

SubscriptionSchema.pre('remove', function(next) {
  this.clearTimer();
  next();
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
