/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const MongoQS = require('mongo-querystring');

const qs = new MongoQS();

const { Subscription, Timer } = require('../models');

router.route('/')
  .get((req, res, next) => {
    if (req.query) {
      const query = qs.parse(req.query)
      Subscription.find(query)
        .then(subscriptions => res.send(subscriptions))
        .catch(next);
    } else {
      Subscription.find({})
        .then(subscriptions => res.send(subscriptions))
        .catch(next);
    }
  })
  .post((req, res, next) => {
    Subscription.create(_.assign(req.body, {
      token: req.token
    }))
      .then(newSub => res.send(newSub))
      .catch(next);
  })
  .delete((req, res, next) => {
    Subscription.remove({})
      .then(() => {
        Timer.clearAll();
      })
      .then(() => res.sendStatus(200))
      .catch(next);
  });

router.route('/:id')
  .get((req, res, next) => {
    Subscription.findById(req.params.id)
      .then((sub) => res.send(sub))
      .catch(next);
  })
  .put((req, res, next) => {
    Subscription.findById(req.params.id)
      .then(sub => {
        _.assign(sub, req.body);
        return sub.save();
      })
      .then(sub => res.send(sub))
      .catch(next);
  })
  .delete((req, res, next) => {
    Subscription
      .findById(req.params.id)
      .then(sub => sub.clearTimer())
      .then(sub => sub.remove())
      .then(() => res.sendStatus(200))
      .catch(next);
  });

module.exports = router;
