FROM resin/intel-nuc-node:7.8.0-20170506

ARG NODE_ENV=prod

RUN apt-get update && apt-get install -y netcat mongodb-org

# Install influxdb
RUN wget -O /tmp/influxdb.deb https://dl.influxdata.com/influxdb/releases/influxdb_1.2.0_amd64.deb && \
    dpkg -i /tmp/influxdb.deb && rm /tmp/influxdb.deb

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
