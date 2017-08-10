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

app.listen(9999, function () {
  console.log('agile API mock server listening on port 9999!')
})
