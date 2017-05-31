#!/bin/bash
mkdir -p /data/influxdb
chown influxdb:influxdb /data/influxdb
influxd -config /etc/influxdb/influxdb.conf &
if [ $NODE_ENV == "TEST" ]
then
  npm run test
else
  npm start
fi
