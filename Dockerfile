FROM resin/raspberrypi3-node:latest

ENV DB_FILE=/data/db.json

# Install influxdb
RUN wget -O /tmp/influxdb.deb https://dl.influxdata.com/influxdb/releases/influxdb_0.13.0_armhf.deb && \
    dpkg -i /tmp/influxdb.deb && rm /tmp/influxdb.deb

# Change influxdb data to be stored in the persising partition
RUN sed -i 's|/var/lib/influxdb|/data/influxdb|g' /etc/influxdb/influxdb.conf

WORKDIR /usr/src/app

COPY package.json package.json

# This install npm dependencies on the resin.io build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.
RUN JOBS=MAX npm install --production --unsafe-perm && npm cache clean && rm -rf /tmp/*

# This will copy all files in our root to the working  directory in the container
COPY . ./

EXPOSE 1338

CMD ["bash", "start.sh"]
