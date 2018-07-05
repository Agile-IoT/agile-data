/*******************************************************************************
 * Copyright (C) 2018 Orange.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *    Rombit - initial API and implementation
 ******************************************************************************/
const express = require('express');
const router = express.Router();
const MongoQS = require('mongo-querystring');
const OwnCloud = require('../clouds/owncloud');
const Dropbox = require('../clouds/dropbox');
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
    res.send({
      clouds:[{
        endpoint: "owncloud",
        displayName: "ownCloud",
        implemented: true
      },{
        endpoint: "dropbox",
        displayName: "Dropbox",
        implemented: true
      }, {
        endpoint: "googleDrive",
        displayName: "Google Drive",
        implemented: false
      }]
    });
  });

router.route('/:cloudId')
  .get((req, res, next) => {
    const {cloudId} = req.params
    if (cloudId === "owncloud"){
      res.send(OwnCloud.endpointDescription());
    } else if (cloudId === "dropbox") {
      res.send(Dropbox.endpointDescription());
    } else if (cloudId === "googledrive") {
      res.status(501).send('Google Drive Cloud not yet implemented');
    }else {
      res.status(406).send('Unsuported cloud provider');
    }
  })
  .post((req, res, next) => {
    const {cloudId} = req.params
    const {customArgs, query} = req.body
    let dbQuery = {}

    if (query) {
      dbQuery = qs.parse(query)
    }

    const upload = {
        "owncloud": OwnCloud.upload,
        "dropbox": Dropbox.upload
    }

    return Record.find(dbQuery)
      .then(data => {
          if (upload[cloudId] === undefined) {
            res.status(406).send('Unsuported cloud provider');
          } else {
            return upload[cloudId](customArgs, data)
          }
        })
        .then(() => res.send("done"))
        .catch(err => res.status(500).send(err.message));
  })

module.exports = router;
