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
const MongoQS = require('mongo-querystring');
const { Record } = require('../models');

const qs = new MongoQS({
  custom: {
    before: 'lastUpdate',
    after: 'lastUpdate',
    between: 'lastUpdate'
  }
});

router.route('/')
  .get((req, res, next) => {
    if (req.query) {
      const query = qs.parse(req.query)
      Record.find(query)
        .then(data => res.send(data))
        .catch(next);
    } else {
      Record.find({})
        .then(data => res.send(data))
        .catch(next);
    }
  })
  .post((req, res, next) => {
    Record.create(req.body)
      .then(data => res.send(data))
      .catch(next);
  })
  .delete((req, res, next) => {
    if (req.query) {
      const query = qs.parse(req.query)
      Record.remove(query)
        .then(() => res.sendStatus(200))
        .catch(next);
    } else {
      Record.remove({})
        .then(() => res.sendStatus(200))
        .catch(next);
    }
  });

router.route('/:id')
  .delete((req, res, next) => {
    Record.findByIdAndRemove(req.params.id)
      .then(() => res.sendStatus(200))
      .catch(next);
  });

module.exports = router;
