## Agile data service

This service allows users to create workers called `subscriptions` that consume the agile API and write data to a timeseries database, it also allows users to query, create retention policies and directly write new measurements to the db.

### API

#### Create subscription for device component

```
method: POST
url: /api/subscription/:device/:component
body: {
  interval: '86400'
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

#### Read, Update & Delete subscriptions also accept also accepts the use custom queries.

```
method: GET
url: /api/subscriptions?query='{"where":{"deviceID":"bleA0E6F8B62304"},"limit":"2","sort":"createdAt DESC"}'
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
url: /api/record?query='{"where":{"deviceID":"bleA0E6F8B62304", "componentID": "temperature"},"limit":"500","sort":"lastUpdate DESC"}'
```

#### Delete all records matching query

```
method: DELETE
url: /api/record?query='{"where":{"deviceID":"bleA0E6F8B62304", "componentID": "temperature"},"limit":"500","sort":"lastUpdate DESC"}'
```

#### Create new record

```
method: POST
url: /api/record
body: {
  'deviceID': 'bleA0E6F8B62304',
  'componentID':'Temperature',
  'value':'23.46875',
  'unit':'Degree celsius',
  'format':',
  'lastUpdate':'1477491668082'
}
```

#### Update Retention

Point at which old records are deleted.

__Note__ It maybe possible to make this more granular eg. for add an expiration for each `Record`. But the difficulty depends on implementation details.

```
method: PUT
url: /api/retention
body: {
  expiration: '3d'
}
```
