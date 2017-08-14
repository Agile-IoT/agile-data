#!/bin/bash
mkdir -p /data/db
chown mongo:mongo /data/db
service mongodb start &
if [ $NODE_ENV == "TEST" ]
then
  npm run test
else
  npm start
fi
