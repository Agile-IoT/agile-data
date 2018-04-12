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
const { Record } = require('../models');

const qs = new MongoQS();

router.route('/')
  .get((req, res, next) => {
    res.send({
      "clouds":[
        {
          "owncloud": {
            "implemented": true
          },
          "dropbox": {
            "implemented": false
          },
          "googleDrive": {
            "implemented": false
          }
        }
      ]
    });
  });

router.route('/:cloudId')
  .get((req, res, next) => {
    const {cloudId} = req.params
    if (cloudId === "owncloud"){
      res.send(OwnCloud.endpointDescription());
    } else if (cloudId === "dropbox") {
      res.status(501).send('Dropbox Cloud not yet implemented');
    } else if (cloudId === "googledrive") {
      res.status(501).send('Google Drive Cloud not yet implemented');
    }else {
      res.status(406).send('Unsuported cloud provider');
    }
  })
  .post((req, res, next) => {
    const {credentials, uploadPath} = req
    const query = qs.parse(req.query)

    if (!uploadPath){
      res.status(400).send("uploadPath not specified");
    }

    if (!query) {
      res.status(400).send("query parameter not found");
    }

    if (!credentials) {
      res.status(400).send('no credentials provided');
    }

    if(!credentials.clientId || !credentials.clientSecret || !credentials.owncloudServer) {
      res.status(400).send('incomplete credentials, please provide the clientId, clientSecret, and ownCloudServer');
    }

    return Record.find(query)
      .then(data => OwnCloud.upload(credentials, uploadPath, data))
        .then(res.send("done"))
        .catch(err => res.status(500).send(err));
  })

module.exports = router;
