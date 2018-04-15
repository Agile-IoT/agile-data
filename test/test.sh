#-------------------------------------------------------------------------------
# Copyright (C) 2018 resin.io, and others
# 
# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/
# 
# SPDX-License-Identifier: EPL-2.0
#-------------------------------------------------------------------------------
trap 'kill $(jobs -p)' EXIT 1

node test/mock.js &
while ! echo exit | nc localhost 9999; do sleep 1; done
node src/index.js &
while ! echo exit | nc localhost 1338; do sleep 1; done
echo "agile-api mock server and agile-data server started" &&
node node_modules/.bin/mocha ./test/**/*.spec.js
