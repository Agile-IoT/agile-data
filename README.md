## Agile data service

This service allows users to create workers called `subscriptions` that consume the agile API and write data to a timeseries database, it also allows users to query, create retention policies and directly write new measurements to the db.

### API

#### Create subscription for device component with 3 second interval

```
method: POST
url: /api/subscription
body: {
  deviceID: 'mySensor',
  componentID: 'temperature',
  interval: '3000'
}
```

#### Delete subscription for device component

```
method: DELETE
url: /api/subscription/:device/:component
```

#### Update subscription for device component

```
method: PUT
url: /api/subscription/:device/:component
body: {
  interval: '10000'
}
```

#### Read subscription for device component

```
method: GET
url: /api/subscription/:device/:component
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
url: /api/record?where={"deviceID":"bleA0E6F8B62304", "componentID": "temperature"}&order={"by": "time", "direction": "DESC"}&limit=3
```

#### Update Retention

Set a interval at which old records expire.

```
method: PUT
url: /api/retention
body: {
  expiration: '3d'
}
```
