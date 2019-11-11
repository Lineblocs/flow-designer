# pathematics

Parse urls and with Express-like url segments

## Install

```
npm install pathematics --save
```

## Usage

Each segement in the source key of the map is injected into the destination value of the map. The map determins which key/value pair to use by comparing the url passed into the method with the map keys.

```js
var pathematics = require('pathematics');
var routesMap = {
  '/some/:segemented/route': '/new/route/:segmented'
};

var url = pathematics(routesMap, '/some/custom/route');

console.log(url); // OUTPUTS: /new/route/custom
```

You can also partialize the function to reuse the object map

```js
var pathematics = require('pathematics');
var routesMap = {
  '/some/:segemented/route': '/new/route/:segmented'
};

var paths = pathematics(routesMap);
var url = paths('/some/custom/route');

console.log(url); // OUTPUTS: /new/route/custom
```

Parseing route segements with custom meta data is also available. If the value if the key/value pair in the object map is an object, it expects the parameter of `url` to define the target path with segements.

```js
var pathematics = require('pathematics');
var routesMap = {
  '/some/:segemented/route': {
    url: '/new/route/:segmented',
    metaData: 'something'
  }
};

var data = pathematics.withMeta(routesMap, '/some/custom/route');

console.log(data);

/*
OUTPUTS:

{
  url: '/new/route/custom',
  meta: {
    url: '/new/route/:segmented',
    metaData: 'something'
  }
}
*/
```

## API

### pathematics(objectMap[, url]);

Generates the parsed url with segments if the url is provided or returns a parsing funciton if no url is provided initially.

* `objectMap` - and object with key values pairs that define routes with segments to match against
* `url` - the url to compare and parse with the `objectMap`

### pathematics.withMeta(objectMap[, url]);

Allows you to pass optional meta data around with route segements with the object map.

## Run Tests

```
npm install
npm test
```