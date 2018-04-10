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
const _ = require('lodash');
const MongoQS = require('mongo-querystring');

const qs = new MongoQS();

const OwnCloud = require('../clouds/owncloud');
const { Record } = require('../models');

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
    if (req.params.cloudId === "owncloud"){
      res.send(OwnCloud.endpointDescription());

    }else if (req.params.cloudId === "dropbox") {
      res.status(501).send('Dropbox Cloud not implemented');
    }else if (req.params.cloudId === "googledrive") {
      res.status(501).send('Google Drive Cloud not implemented');
    }else {
      res.status(406).send('Unknown cloud');
    }
    res.send("hello world");
  })
  .post((req, res, next) => {
    if (req.query) {
      const query = qs.parse(req.query);
      if (req.body.credentials === undefined || req.body.credentials.clientId === undefined || req.body.credentials.clientSecret === undefined || req.body.credentials.owncloudServer === undefined){
        res.status(400).send("body credentials parameters not correct, please include clientId, clientSecret and owncloudServer");
      }else if (req.body.uploadPath === undefined){
        res.status(400).send("uploadPath not specified");
      }else{
        Record.find(query)
          .then(data => {
            return OwnCloud.upload(req.body.credentials, req.body.uploadPath , data)
          })
          .then(() => res.send("done"))
          .catch((err) => res.status(500).send(err));
      }
    } else {
      res.status(400).send("query parameter not found");
    }

  });

module.exports = router;
