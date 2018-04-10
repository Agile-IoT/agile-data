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

const OwnCloud = require('../clouds/owncloud');
const { Record } = require('../models');

// console.log("---- OwnCloud -----");
// console.log(OwnCloud);
// console.log("---- OwnCloud endpoint -----");
// console.log(OwnCloud.endpointDescription);

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
      let credentials = {
        "clientId": "agile",
        "clientSecret": "test",
        "owncloudServer": "http://agile-owncloud.romcloud.be/owncloud"};
      Record.find(query)
        .then(data => {
          console.log("--- Owncloud data ---");
          console.log(data);
          return OwnCloud.upload(credentials, "testFolder/testfile.txt", data)
        })
        .then(() => res.send("done"))
        .catch((err) => res.status(500).send(err));
    } else {
      res.status(400).send("query parameter not found");
    }

  });

module.exports = router;
