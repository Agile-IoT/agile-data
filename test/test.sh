#-------------------------------------------------------------------------------
# Copyright (C) 2017 Create-Net / FBK.
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
# 
# Contributors:
#     Create-Net / FBK - initial API and implementation
#-------------------------------------------------------------------------------
trap 'kill $(jobs -p)' EXIT 1

while ! echo exit | nc localhost 8086; do sleep 1; done
node test/mock.js &
while ! echo exit | nc localhost 8080; do sleep 1; done
node src/index.js &
while ! echo exit | nc localhost 1338; do sleep 1; done
echo "agile-api mock server and agile-data server started" &&
node node_modules/.bin/mocha ./test/**/*.spec.js
