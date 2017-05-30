set -e
trap 'kill $(jobs -p)' EXIT 1

node test/mock.js &
while ! echo exit | nc localhost 8080; do sleep 1; done
node src/index.js &
while ! echo exit | nc localhost 1338; do sleep 1; done
echo "agile-api mock server and agile-data server started" &&
node node_modules/.bin/mocha ./test/**/*.spec.js
