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
const { Settings } = require('../models');

router.route('/')
  .get((req, res, next) => {
    Settings.findOne({})
      .then(s => {
        if (s.length < 1) {
          Settings.create({});
        }
        return s;
      })
      .then(s => res.send(s))
      .catch(next);
  })
  .put((req, res, next) => {
    Settings.findOne({})
      .then(s => s.update(req.body))
      .then(_ => Settings.findOne({}))
      .then(s => res.send(s))
      .catch(next);
  });

module.exports = router;
