ARG BASEIMAGE_BUILD=resin/raspberry-pi3-node:7.8.0-20170426

FROM $BASEIMAGE_BUILD

ARG NODE_ENV=prod

RUN apt-get update && apt-get install -y netcat mongodb \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json package.json

# This install npm dependencies on the resin.io build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.

RUN JOBS=MAX npm install

# This will copy all files in our root to the working  directory in the container
COPY . ./

EXPOSE 1338

ENV INIT_SYSTEM on

CMD ["bash", "start.sh"]
