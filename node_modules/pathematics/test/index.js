var expect = require('chai').expect;
var pathematics = require('../index.js');
var pathMap = {
  '/test/:segment': '/new/:segment'
};

describe('pathematics', function () {
  
  it('parses the url from the path map', function () {
    var url = pathematics(pathMap, '/test/route');
    expect(url).to.equal('/new/route');
  });
  
  it('parses urls with no segments', function () {
    var url = pathematics({'/test': '/new'}, '/test');
    expect(url).to.equal('/new');
  });
  
  it('returns a partial function if url argument is omitted', function () {
    var parse = pathematics(pathMap);
    var url = parse('/test/route');
    expect(url).to.equal('/new/route');
  });
  
  it('parses the url with segments when the value in the object map is an object', function () {
    var parse = pathematics({
      '/test/:segment': {
        url: '/new/:segment'
      }
    });
    var url = parse('/test/route');
    expect(url).to.equal('/new/route');
  });
  
  it('parses meta data passed in with object map and segments', function () {
    var parse = pathematics({
      '/test/:segment': {
        status: 301,
        url: '/new/:segment'
      }
    });
    var data = parse.withMeta('/test/route');
    
    expect(data.url).to.equal('/new/route');
    expect(data.meta.status).to.equal(301);
  });
  
  it('parses meta data from object map without a partailized function', function () {
    var data = pathematics.withMeta({
      '/test/:segment': {
        status: 301,
        url: '/new/:segment'
      }
    }, '/test/route');
    
    expect(data.url).to.equal('/new/route');
    expect(data.meta.status).to.equal(301);
  });
  
  it('handles having no matching segments without meta', function () {
    var data = pathematics({
      '/test/:segment': '/new/:segment'
    }, '/none/route');
    
    expect(data).to.equal(undefined);
  });
  
  it('handles having no matching segments with meta', function () {
    var data = pathematics.withMeta({
      '/test/:segment': {
        url: '/new/:segment'
      }
    }, '/none/route');
    
    expect(data).to.eql({});
  });
  
});