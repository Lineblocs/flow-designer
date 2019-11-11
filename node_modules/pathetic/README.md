# pathetic

Get values by path-like keys

## Install

```
npm install pathetic --save
```

## Usage

```js
var pathetic = require('pathetic');
var routes = pathetic({
  '/path': {key: 'value'},
  '/user/:id': function (req, res) {
    res.end('GOT IT!')
  }
});

var p = routes('/path'); // OUTPUTS: {key: 'value'}
var userPath = routes('/user/123');

userPath(req, res);
console.log(userPath.params().id == 123);
```

## API

### pathetic(paths)

* `paths` - a key/value object containing the paths as the keys and anything for the values. This returns a method that lets you query against the table with a path. This uses Express-like paths and breaks out the parameters for your as well.


## Run Tests

```
npm install
npm test
```