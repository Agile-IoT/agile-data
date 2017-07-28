/*******************************************************************************
 *Copyright (C) 2017 Resin.io.
 *All rights reserved. This program and the accompanying materials
 *are made available under the terms of the Eclipse Public License v1.0
 *which accompanies this distribution, and is available at
 *http://www.eclipse.org/legal/epl-v10.html
 *
 *Contributors:
 *    Resin.io - initial API and implementation
 ******************************************************************************/
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const influx = require('../models/influxdb');
const squel = require('squel');
const config = require('../config');

function buildQuery (query) {
  let queryObj = squel.select().from('records');

  if (query.where) {
    const whereStatements = JSON.parse(query.where);
    _.forEach(Object.keys(whereStatements), (key) => {
      queryObj.where(`${key}=?`, whereStatements[key]);
    });
  }

  if (query.limit) {
    queryObj.limit(query.limit);
  }

  if (query.order) {
    const order = JSON.parse(query.order);
    queryObj.order(order.by, order.direction);
  }

  return queryObj.toString();
}

router.route('/')
  .get((req, res, next) => {
    const query = buildQuery(req.query);
    influx.query(query)
    .then((data) => {
      res.send(data);
    })
    .catch(next);
  })
  .post((req, res, next) => {
    res.send('coming soong :)');
  })
  .delete((req, res, next) => {
    res.send('coming soong :)');
  });

router.route('/retention')
  .get((req, res, next) => {
    influx.showRetentionPolicies()
    .then(policies => {
      res.send(_.find(policies, { name: config.DB_RP_NAME }));
    })
    .catch(next);
  })
  .put((req, res, next) => {
    if (!req.body.duration) {
      throw new Error('body.duration required');
    }
    // we only maintain one policy and keep altering it.
    influx.alterRetentionPolicy(config.DB_RP_NAME, {
      duration: req.body.duration,
      replication: 1,
      isDefault: true
    })
    .then(data => {
      return influx.showRetentionPolicies();
    })
    .then(policies => {
      res.send(_.find(policies, { name: config.DB_RP_NAME }));
    })
    .catch(next);
  });

module.exports = router;
