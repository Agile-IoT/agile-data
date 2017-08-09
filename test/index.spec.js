const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const config = require('../src/config');
const _ = require('lodash');

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

describe('Subscription', function() {
  it('create', function(done) {
    agile.data.subscription.create(
      DUMMY_SUBSCRIPTION.deviceID,
      DUMMY_SUBSCRIPTION.componentID,
      DUMMY_SUBSCRIPTION.interval
    )
    .then((sub) => {
      expect(sub.deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      done();
    })
    .catch(err => console.error(err));
  });

  it('get', function(done) {
    agile.data.subscription.get()
    .then((data) => {
      expect(data).to.be.an('array');
      expect(data[0].deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      done();
    });
  });

  it('get subscription by device ID', function(done) {
    agile.data.subscription.get(
      DUMMY_SUBSCRIPTION.deviceID
    )
    .then((data) => {
      expect(data).to.be.an('array');
      expect(data[0].deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      done();
    });
  });

  it('get subscription by device/component ID', function(done) {
    agile.data.subscription.get(
      DUMMY_SUBSCRIPTION.deviceID,
      DUMMY_SUBSCRIPTION.componentID
    )
    .then((data) => {
      expect(data).to.be.an('object');
      expect(data.deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      expect(data.componentID).to.equal(DUMMY_SUBSCRIPTION.componentID);
      done();
    });
  });

  it('update', function(done) {
    agile.data.subscription.update(
      DUMMY_SUBSCRIPTION.deviceID,
      DUMMY_SUBSCRIPTION.componentID,
      DUMMY_SUBSCRIPTION_UPDATE.interval
    )
    .then((data) => {
      expect(data.interval).to.equal(DUMMY_SUBSCRIPTION_UPDATE.interval);
      done();
    });
  });

  it('delete', function(done) {
    agile.data.subscription.delete(
      DUMMY_SUBSCRIPTION.deviceID,
      DUMMY_SUBSCRIPTION.componentID
    )
    .then((data) => {
      expect(data).to.equal('');
      done();
    });
  });
});

describe('record', function() {

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

  describe('retention', function() {
    it('get', function(done) {
      agile.data.retention.get()
      .then((data) => {
        expect(data).to.be.an('object');
        done();
      });
    });

    it('update', function(done) {
      agile.data.retention.update('1d')
      .then((data) => {
        expect(data.duration).to.equal('24h0m0s');
        done();
      });
    });
  });
});
