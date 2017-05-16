# base-image for node on any machine using a template variable,
# see more about dockerfile templates here: http://docs.resin.io/deployment/docker-templates/
# and about resin base images here: http://docs.resin.io/runtime/resin-base-images/
# Note the node:slim image doesn't have node-gyp
FROM resin/raspberrypi2-node

RUN apt-get update && apt-get install -yq \
    apt-transport-https && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://repos.influxdata.com/influxdb.key | apt-key add -
RUN echo "deb https://repos.influxdata.com/debian jessie stable" | tee /etc/apt/sources.list.d/influxdb.list

RUN apt-get update && apt-get install -yq \
    influxdb && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Defines our working directory in container
WORKDIR /usr/src/app

# Copies the package.json first for better cache on later pushes
COPY package.json package.json

# This install npm dependencies on the resin.io build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.
RUN JOBS=MAX npm install --production --unsafe-perm && npm cache clean && rm -rf /tmp/*

# This will copy all files in our root to the working  directory in the container
COPY . ./

EXPOSE 8083
EXPOSE 8086

CMD ["npm", "start"]
