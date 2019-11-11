var redirect = require('../');
var connect = require('connect');
var request = require('supertest');

describe('redirect middleware', function () {
  
  it('skips the middleware if there are no redirects configured', function (done) {
    var app = connect()
      .use(redirect({}));
    
    request(app)
      .get('/')
      .expect(404)
      .end(done);
  });
  
  it('skips middleware when there are no matching redirects', function (done) {
    var app = connect()
      .use(redirect({
        '/source': '/redirect'
      }));
    
    request(app)
      .get('/none')
      .expect(404)
      .end(done);
  });
  
  it('redirects to a configured redirects object with a default status code of 301', function (done) {
    var app = connect()
      .use(redirect({
        '/source': '/redirect'
      }));
    
    request(app)
      .get('/source')
      .expect(301)
      .expect('location', '/redirect')
      .end(done);
  });
  
  it('redirects to a configured path with a custom status code', function (done) {
    var app = connect()
      .use(redirect({
        '/source': {
          status: 302,
          url: '/redirect'
        }
      }));
    
    request(app)
      .get('/source')
      .expect(302)
      .expect('location', '/redirect')
      .end(done);
  });
  
  it('adds leading slash to all redirect paths', function (done) {
    var app = connect()
      .use(redirect({
        'source': '/redirect' // No slash
      }));
    
    request(app)
      .get('/source')
      .expect(301)
      .expect('location', '/redirect')
      .end(done);
  });
  
  it('redirects using glob negation', function (done) {
    var app = connect()
      .use(redirect({
        '!source': '/redirect' // No slash
      }));
    
    request(app)
      .get('/anthing')
      .expect(301)
      .expect('location', '/redirect')
      .end(done);
  });
  
  it('redirects using segements in the url path', function (done) {
    var app = connect()
      .use(redirect({
        '/old/:value/path/:loc': '/new/:value/path/:loc'
      }));
    
    request(app)
      .get('/old/redirect/path/there')
      .expect(301)
      .expect('location', '/new/redirect/path/there')
      .end(done);
  });
  
  it('redirects using segements with a custom status code', function (done) {
    var app = connect()
      .use(redirect({
        '/old/:value/path/:loc': {
          status: 302,
          url: '/new/:value/path/:loc'
        }
      }));
    
    request(app)
      .get('/old/redirect/path/there')
      .expect(302)
      .expect('location', '/new/redirect/path/there')
      .end(done);
  });
  
  it('redirects to external url', function (done) {
    var app = connect()
      .use(redirect({
        '/source': 'http://redirectedto.com'
      }));
    
    request(app)
      .get('/source')
      .expect(301)
      .expect('Location', 'http://redirectedto.com')
      .end(done);
  });
  
  it('redirects to external url over https', function (done) {
    var app = connect()
      .use(redirect({
        '/source': 'https://redirectedto.com'
      }));
    
    request(app)
      .get('/source')
      .expect(301)
      .expect('Location', 'https://redirectedto.com')
      .end(done);
  });
});