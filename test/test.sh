trap 'kill $(jobs -p)' EXIT 1
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

node test/mock.js &
while ! echo exit | nc localhost 9999; do sleep 1; done
node src/index.js &
while ! echo exit | nc localhost 1338; do sleep 1; done
echo "agile-api mock server and agile-data server started" &&
node node_modules/.bin/mocha ./test/**/*.spec.js
