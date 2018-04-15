/*******************************************************************************
 * Copyright (C) 2018 resin.io, and others
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const config = require('../src/config');
const _ = require('lodash');
const fs = require('fs');
const crypto = require('crypto');
const timers = require('../src/models/timer')
const MongoClient = require('mongodb').MongoClient
chai.use(chaiAsPromised);
const agile = require('agile-sdk')({
  api: config.AGILE_API,
  idm: config.AGILE_IDM,
  data: config.AGILE_DATA
});

const PRIVATE_KEY = fs.readFileSync('test/foo.key.pem', 'utf8');
const PUBLIC_KEY = fs.readFileSync('test/foo.pub', 'utf8');

DUMMY_SUBSCRIPTION = {
  deviceID: 'myDevice',
  componentID: 'temperature',
  interval: 1000,
}

DUMMY_SUBSCRIPTION_UPDATE = {
  interval: 3000,
}

// global db connection;
let mongoDB;
const collections = [
  'subscriptions',
  'records'
]

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function dropCollections(done) {
  timers.clearAll()
  Promise.all(collections.map((c) => {
    return mongoDB.collection(c).remove({})
  }))
  .then((data) => {
    done()
  })
  .catch(done)
}

function dbConnectionOpen (done) {
  var url = 'mongodb://localhost/agile-data';
  MongoClient.connect(url, function(err, db) {
    if (err) console.log(err)
    mongoDB = db

    done();
  })
}

function dbConnectionClose (done) {
  mongoDB.close();
  done();
}

describe('agile data', function () {
  before(dbConnectionOpen);
  beforeEach(dropCollections);
  afterEach(dropCollections);
  after(dbConnectionClose);

  describe('Subscription', function() {
    this.timeout(5000)
    it('create', function(done) {
      console.time('create')
      agile.data.subscription.create(
        DUMMY_SUBSCRIPTION
      )
      .then((sub) => {
        console.time('create')
        expect(sub.deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
        done();
      })
      .catch(done)
    });

    it('get', function(done) {
      agile.data.subscription.create(
        DUMMY_SUBSCRIPTION
      )
      .then(agile.data.subscription.get)
      .then((data) => {
        expect(data).to.be.an('array');
        expect(data[0]).to.have.any.keys('deviceID', 'componentID', 'interval', 'retention', 'subscription');
        done();
      })
      .catch(done)
    });

    it('get with ID', function(done) {
      agile.data.subscription.create(
        DUMMY_SUBSCRIPTION
      )
      .then((sub) => agile.data.subscription.get(sub._id))
      .then((data) => {
        expect(data).to.be.an('array');
        expect(data[0]).to.have.any.keys('deviceID', 'componentID', 'interval', 'retention', 'subscription');
        done();
      })
      .catch(done)
    });

    it('update', function(done) {
      agile.data.subscription.create(
        DUMMY_SUBSCRIPTION
      )
      .then(sub => {
        return agile.data.subscription.update(sub._id, DUMMY_SUBSCRIPTION_UPDATE)
      })
      .then((sub) => {
        expect(sub.interval).to.equal(DUMMY_SUBSCRIPTION_UPDATE.interval);
        done();
      })
      .catch(done)
    });

    it('delete', function(done) {
      agile.data.subscription.create(
        DUMMY_SUBSCRIPTION
      )
      .then(sub => {
        return agile.data.subscription.delete(sub._id)
      })
      .then((data) => {
        expect(data).to.equal('OK');
        done();
      })
      .catch(done)
    });

    it('should allow encryption', function (done) {
      const newSub = Object.assign({}, DUMMY_SUBSCRIPTION, {
        encrypt: {
          key: new Buffer(PUBLIC_KEY).toString('base64'),
          fields: [
            'value',
          ]
        }
      });

      let subId;

      agile.data.subscription.create(newSub)
      .then((data) => {
        subId = data._id;
        expect(data.encrypt.key).to.not.equal(undefined);
        expect(data.encrypt.key).to.equal(new Buffer(PUBLIC_KEY).toString('base64'));

        // wait for some data to be collected
        return sleep(2000);
      })
      .then(() => {
        return agile.data.record.get()
      })
      .then((data) => {
        const record = data.find(x => x.subscription === subId)
        const d = crypto.privateDecrypt(PRIVATE_KEY, Buffer.from(record.value, 'base64'));
      // check that it's a legit mocked value
        expect(Number(d.toString())).to.be.within(0, 100);
        done();
      })
      .catch(done)
    })
  });

  describe('record', function() {
    it('get', function(done) {
      agile.data.record.get()
      .then((data) => {
        expect(data).to.be.an('array');
        done();
      })
      .catch(done)
    });

    it('get with query', function(done) {
      agile.data.subscription.create({
        deviceID: 'deviceA',
        componentID: 'humidity',
        interval: 100, // super short so we can query right away
      })
      .then(() => {
        return agile.data.subscription.create({
          deviceID: 'deviceB',
          componentID: 'humidity',
          interval: 100, // super short so we can query right away
        })
      })
      .then(() => sleep(500))
      .then(() => {
        return agile.data.record.get(`deviceID=deviceB`)
      })
      .then((data) => {
        expect(data).to.be.an('array');
        // ensure query works as expected
        data.map(record => {
          expect(record.deviceID === 'deviceB')
        });
        done();
      })
      .catch(done)
    }).timeout(5000)
  });


  describe('settings', function() {
    it('get', function(done) {
      agile.data.settings.get()
      .then((data) => {
        expect(data).to.be.an('object');
        expect(data).to.have.any.keys('retention', 'updated_at');
        done();
      })
      .catch(done)
    });

    it('update', function(done) {
      agile.data.settings.update({
        retention: '4d'
      })
      .then((data) => {
        expect(data).to.be.an('object');
        expect(data.retention).to.equal('4d');
        done();
      })
      .catch(done)
    });
  });

}).timeout(5000)
