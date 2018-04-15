#!/bin/bash
mkdir -p /data/db
rm /data/db/mongod.lock
/usr/bin/mongod --dbpath /data/db --repair
/usr/bin/mongod --dbpath /data/db --fork --logpath mongod.log &&
if [ $NODE_ENV == "TEST" ]
then
  npm run test
else
  npm start
fi
