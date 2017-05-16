var wsClient = new WebSocketClient();

wsClient.on('connectFailed', function(error) {
    debug.error('Connect Error: ' + error.toString());
});

wsClient.on('connect', function(connection) {
    debug.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        debug.error("Connection Error: " + error.toString());
    });
    connection.on('close', function() {1
        debug.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
          let resource = JSON.parse(message.utf8Data)
          debug.verbose(resource)

          dbClient.writePoint(
            dbMeasurement,
            { lastUpdate: resource.lastUpdate, value: resource.value },
            { deviceID: resource.deviceID, stream: resource.componentID, unit: resource.unit },
            { db: dbName },
            function (err) {
              if (err) throw err
            }
          )
        }
    });
});

wsClient.connect(wsAddress);


var influx = Influx.InfluxDB({
  host: 'localhost',
  database: dbName,
  schema: [
    {
      measurement: 'response_times',
      fields: {
        unit: Influx.FieldType.STRING,
        value: Influx.FieldType.FLOAT,
        format: Influx.FieldType.STRING,
        lastUpdate: Influx.FieldType.STRING,
      },
      tags: [
        'deviceID', 'componentID'
      ]
    }
  ]
})

influx.createDatabase('agile_db').then(() => {
  console.log('finished!');
})
