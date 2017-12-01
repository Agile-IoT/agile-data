## Agile data service

[![Build Status](https://travis-ci.org/Agile-IoT/agile-data.svg?branch=master)](https://travis-ci.org/Agile-IoT/agile-data)

This service allows users to create workers called `subscriptions` that consume the agile API and write data to a timeseries database, it also allows users to query, create retention policies and directly write new measurements to the db.

### API

#### Create subscription for device component

```
method: POST
url: /api/subscription
body: {
  deviceID: 'mySensor',
  componentID: 'temperature',
  // all keys below are optional
  interval: '3000', // measure every 3s
  retention: '7d' // All records created by this subscription are deleted after 7 days,
  encrypt: {
    key:  // base64 encoded public key,
    fields: [
      'value',
    ] // List of keys, which values will be encrypted.
  }
}
```

#### Delete subscription for device component

```
method: DELETE
url: /api/subscription/:subscriptionId
```

#### Update subscription for device component

```
method: PUT
url: /api/subscription/:subscriptionId
body: {
  interval: '10000'
}
```

#### Read subscription for device component

```
method: GET
url: /api/subscription/:subscriptionId
```


#### Read subscriptions all subscriptions on gateway

```
method: GET
url: /api/subscription
```


#### Get all records

If the request is made with with ws then a connect is opened an results will be streamed, if the request is standard http then JSON object will be returned.

```
method: GET
url: /api/records
```

#### Get all records with query

```
method: GET
url: /api/record?<query>
```

### update Settings

```
method: PUT
url: /api/settings
body: {
  interval: 3000
}
```

### get Settings

```
method: GET
url: /api/settings
```
