FROM resin/raspberrypi-3-node:latest

ENV DB_FILE=/data/db.json

RUN apt-get update && apt-get install -yq \
    apt-transport-https && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://repos.influxdata.com/influxdb.key | apt-key add -
RUN echo "deb https://repos.influxdata.com/debian jessie stable" | tee /etc/apt/sources.list.d/influxdb.list

# Change influxdb data to be stored in the persising partition
RUN sed -i 's|/var/lib/influxdb|/data/influxdb|g' /etc/influxdb/influxdb.conf

RUN apt-get update && apt-get install -yq \
    influxdb && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json package.json

# This install npm dependencies on the resin.io build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.
RUN JOBS=MAX npm install --production --unsafe-perm && npm cache clean && rm -rf /tmp/*

# This will copy all files in our root to the working  directory in the container
COPY . ./

EXPOSE 1338

CMD ["bash", "start.sh"]
