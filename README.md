## Agile data service

This service consumes all data events from the agile API and writes them to an influx series.

### Configuration

| Environment Variable      | Description                                                     | Defualt                  |
|---------------------------|-----------------------------------------------------------------|--------------------------|
| AGILE_DATA_DB_NAME        | Influx db name                                                  | agile_db                 |
| AGILE_DATA_DB_MEASUREMENT | Influx measurement (all values are written to one               | sensors                  |
| DEBUG                     | Select module to debug eg. agile-data                           | none                     |
| DEBUG_LEVEL               | Debug level: 'log', 'error', 'warn', 'debug', 'info', 'verbose' | none                     |
| AGILE_DATA_WS_ADDRESS     | Websocket address of agile-core                                 | ws://agile-core:8080/ws/ |


The following tags are written with each measurement:

| Tags     | Description              |
|----------|--------------------------|
| deviceID | agile device id          |
| stream   | agile device stream name |
| unit     | agile device stream unit |

The following values are written with each measurement:

| Values     | Description                   |
|------------|-------------------------------|
| value      | Data reading from sensor      |
| lastUpdate | Timestamp of the data reading |

## TODO

- [ ] Add eslint
- [ ] Add pm2
- [ ] Don't hardcode ports
