const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const config = require('../src/config');
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient

const agile = require('agile-sdk')({
  api: config.AGILE_API,
  idm: config.AGILE_IDM,
  data: config.AGILE_DATA
});

chai.use(chaiAsPromised);

DUMMY_SUBSCRIPTION = {
  deviceID: 'myDevice',
  componentID: 'temperature',
  interval: 9000,
}

DUMMY_SUBSCRIPTION_UPDATE = {
  interval: 3000,
}

let mongoDB;
const collections = [
  'subscriptions',
  'records'
]

describe('Subscription', function() {
  before(function(done) {
    var url = 'mongodb://localhost/agile-data';
    MongoClient.connect(url, function(err, db) {
      if (err) console.log(err)
      mongoDB = db

      done();
    });
  });

  beforeEach(function(done) {
    Promise.all(collections.map((c) => {
      return mongoDB.collection(c).remove({})
    }))
    .then((data) => {
      // console.log(data)
      done()
    })
    .catch((err) => console.log(err))
  });

  it('create', function(done) {
    agile.data.subscription.create(
      DUMMY_SUBSCRIPTION
    )
    .then((sub) => {
      expect(sub.deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      done();
    })
    .catch(err => console.error(err));
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
    });
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
    });
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
    });
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
    });
  });
});

describe('record', function() {
  before(function(done) {
    var url = 'mongodb://localhost/agile-data';
    MongoClient.connect(url, function(err, db) {
      if (err) console.log(err)
      mongoDB = db

      done();
    });
  });

  beforeEach(function(done) {
    Promise.all(collections.map((c) => {
      return mongoDB.collection(c).remove({})
    }))
    .then((data) => {
      // console.log(data)
      done()
    })
    .catch((err) => console.log(err))
  });

  it('get', function(done) {
    agile.data.record.get()
    .then((data) => {
      expect(data).to.be.an('array');
      done();
    });
  });

  it('get with query', function(done) {
    agile.data.record.get(`where={"deviceID":"${DUMMY_SUBSCRIPTION.deviceID}"}&order={ "by": "time", "direction": "ASC"}`)
    .then((data) => {
      expect(data).to.be.an('array');
      done();
    });
  });
});


describe('record', function() {
  it('get', function(done) {
    agile.data.settings.get()
    .then((data) => {
      expect(data).to.be.an('object');
      expect(data).to.have.any.keys('retention', 'updated_at');
      done();
    });
  });

  it('update', function(done) {
    agile.data.settings.update({
      retention: '4d'
    })
    .then((data) => {
      expect(data).to.be.an('object');
      expect(data.retention).to.equal('4d');
      done();
    });
  });
});
