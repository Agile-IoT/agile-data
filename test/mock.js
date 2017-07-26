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
var express = require('express')
var app = express()
var Chance = require('chance'),
    chance = new Chance();

app.get('/api/device/:deviceId/:componentId/lastUpdate', function (req, res) {
  res.send({
    deviceID: req.params.deviceId,
    componentID: req.params.componentId,
    value: chance.floating({min: 0, max: 100}),
    unit: "Degree celsius",
    format:"",
    lastUpdate: Date.now()
  })
})

app.post('/api/protocols/discovery', function (req, res) {
  res.status(204).send()
})

app.listen(8080, function () {
  console.log('agile API mock server listening on port 8080!')
})
