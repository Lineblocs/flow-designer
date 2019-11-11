var pathetic = require('../');
var expect = require('expect.js');

describe('pathetic', function() {
  it('matches a simple path', function () {
    var paths = pathetic({
      '/path': {key: 'value'}
    });
    
    expect(paths('/path').value.key).to.equal('value');
    expect(paths('/path').params).to.eql({});
  });
  
  it('matches a path with a key', function () {
    var paths = pathetic({
      '/user/:id': {user: 'id'}
    });
    
    expect(paths('/user/123').value.user).to.equal('id');
    expect(paths('/user/123').params).to.eql({
      id: 123
    });
  });
});