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
#-------------------------------------------------------------------------------
# Copyright (C) 2017 Resin.io.
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
# 
# Contributors:
#     Resin.io - initial API and implementation
#-------------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const subscriptions = require('../models/subscription');
const _ = require('lodash');

router.route('/')
  .get((req, res, next) => {
    subscriptions.get(req.params)
    .then((data) => res.send(data))
    .catch(next);
  })
  .post((req, res, next) => {
    subscriptions.create(req.body)
    .then((data) => res.send(data))
    .catch(next);
  });

router.route('/:deviceID')
  .get((req, res, next) => {
    subscriptions.get(req.params)
    .then((data) => res.send(data))
    .catch(next);
  });

router.route('/:deviceID/:componentID')
  .get((req, res, next) => {
    subscriptions.get(req.params)
    .then((data) => res.send(data))
    .catch(next);
  })
  .put((req, res, next) => {
    const newSub = _.assign({
      interval: req.body.interval
    }, req.params);

    subscriptions.update(newSub)
    .then((data) => res.send(data))
    .catch(next);
  })
  .delete((req, res, next) => {
    subscriptions.delete(req.params)
    .then(() => res.send())
    .catch(next);
  });

module.exports = router;
