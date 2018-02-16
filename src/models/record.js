/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
const mongoose = require('./mongoose');
const ms = require('ms');
const QueryPlugin = require('mongoose-query');


const recordSchema = new mongoose.Schema({
  componentID: { type: String, required: true },
  deviceID: { type: String, required: true },
  value: String,
  unit: String,
  format: String,
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  lastUpdate: Date,
  expireAt: Date
});

recordSchema.plugin(QueryPlugin);

recordSchema.pre('save', function (next) {
  mongoose.models.Subscription
    .findOne({ _id: this.subscription })
    .exec()
    .then(subscription => {
      if (!this.createdAt) {
        this.createdAt = Date.now();
      }
      if (!this.expireAt && subscription) {
        this.expireAt = Date.now() + ms(subscription.retention);
      }

      next();
    })
    .catch(err => {
      next(err);
    });
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
