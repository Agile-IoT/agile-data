FROM resin/raspberrypi3-node:7-20170531

ARG NODE_ENV=prod
ENV DB_FILE=/data/db.json

RUN apt-get update && apt-get install -y netcat

# Install influxdb
RUN wget -O /tmp/influxdb.deb https://dl.influxdata.com/influxdb/releases/influxdb_1.2.0_armhf.deb && \
    dpkg -i /tmp/influxdb.deb && rm /tmp/influxdb.deb

# Change influxdb data to be stored in the persising partition
# RUN sed -i 's|/var/lib/influxdb|/data/influxdb|g' /etc/influxdb/influxdb.conf

WORKDIR /usr/src/app

COPY package.json package.json

# This install npm dependencies on the resin.io build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.

RUN JOBS=MAX npm install

# This will copy all files in our root to the working  directory in the container
COPY . ./

COPY ./src/config/influxdb.conf /etc/influxdb/influxdb.conf

EXPOSE 1338

ENV INIT_SYSTEM on

CMD ["bash", "start.sh"]
