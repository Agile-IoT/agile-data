const Axios = require('axios');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var axios = Axios.create({
  baseURL: 'http://localhost:1338/api'
});

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
    axios.post('/subscription', DUMMY_SUBSCRIPTION)
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.data.deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      done();
    });
  });

  it('get', function(done) {
    axios.get('/subscription')
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.data).to.be.an('array');
      expect(res.data[0].deviceID).to.equal(DUMMY_SUBSCRIPTION.deviceID);
      done();
    });
  });

  it('update', function(done) {
    axios.put(`/subscription/${DUMMY_SUBSCRIPTION.deviceID}/${DUMMY_SUBSCRIPTION.componentID}`, DUMMY_SUBSCRIPTION_UPDATE)
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.data.interval).to.equal(DUMMY_SUBSCRIPTION_UPDATE.interval);
      done();
    });
  });

  it('delete', function(done) {
    axios.delete(`/subscription/${DUMMY_SUBSCRIPTION.deviceID}/${DUMMY_SUBSCRIPTION.componentID}`)
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.data).to.equal('');
      done();
    });
  });
});

describe('record', function() {

  it('get', function(done) {
    axios.get('/record')
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.data).to.be.an('array');
      done();
    });
  });

  it('get with query', function(done) {
    axios.get(`/record?where={"deviceID":"${DUMMY_SUBSCRIPTION.deviceID}"}&order={ "by": "time", "direction": "ASC"}`)
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.data).to.be.an('array');
      done();
    });
  });

  describe('retention', function() {
    it('get', function(done) {
      axios.get('/record/retention')
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.data).to.be.an('object');
        done();
      });
    });

    it('update', function(done) {
      axios.put('/record/retention', {
        duration: '1d'
      })
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.data.duration).to.equal('24h0m0s');
        done();
      });
    });
  });
});
