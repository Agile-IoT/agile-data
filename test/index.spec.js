const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const config = require('../src/config');
const _ = require('lodash');
const fs = require('fs');
const crypto = require('crypto');
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
  interval: 9000,
}

DUMMY_SUBSCRIPTION_UPDATE = {
  interval: 3000,
}

// global db connection
let mongoDB;
const collections = [
  'subscriptions',
  'records'
]

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function dropCollections(done) {
  Promise.all(collections.map((c) => {
    return mongoDB.collection(c).remove({})
  }))
  .then((data) => {
    done()
  })
  .catch(done)
}

function dbConnection (done) {
  var url = 'mongodb://localhost/agile-data';
  MongoClient.connect(url, function(err, db) {
    if (err) console.log(err)
    mongoDB = db

    done();
  })
}

describe('Subscription', function() {
  before(dbConnection);
  beforeEach(dropCollections);
  afterEach(dropCollections);

  it('create', function(done) {
    agile.data.subscription.create(
      DUMMY_SUBSCRIPTION
    )
    .then((sub) => {
      expect(sub.deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      done();
    })
    .catch(done)
  });

  it('get', function(done) {
    agile.data.subscription.create(
      DUMMY_SUBSCRIPTION
    )
    .then(() => agile.data.subscription.get())
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
      interval: 1000,
      encrypt: {
        key: new Buffer(PUBLIC_KEY).toString('base64'),
        fields: [
          'value',
        ]
      }
    });

    agile.data.subscription.create(newSub)
    .then((data) => {
      expect(data.encrypt.key).to.not.equal(undefined);
      expect(data.encrypt.key).to.equal(new Buffer(PUBLIC_KEY).toString('base64'));

      // wait for some data to be collected
      return sleep(2000);
    })
    .then(() => {
      return agile.data.record.get()
    })
    .then((data) => {
      const d = crypto.privateDecrypt(PRIVATE_KEY, Buffer.from(data[0].value, 'base64'));
      // check that it's a legit mocked value
      expect(Number(d.toString())).to.be.within(0, 100);
      done();
    })
    .catch(done)
  }).timeout(5000)
});

describe('record', function() {
  beforeEach(dropCollections);
  afterEach(dropCollections);

  it('get', function(done) {
    agile.data.record.get()
    .then((data) => {
      expect(data).to.be.an('array');
      done();
    })
    .catch(done)
  });

  it('get with query', function(done) {
    agile.data.record.get(`where={"deviceID":"${DUMMY_SUBSCRIPTION.deviceID}"}&order={ "by": "time", "direction": "ASC"}`)
    .then((data) => {
      expect(data).to.be.an('array');
      done();
    })
    .catch(done)
  });
});


describe('record', function() {
  beforeEach(dropCollections);
  afterEach(dropCollections);

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
