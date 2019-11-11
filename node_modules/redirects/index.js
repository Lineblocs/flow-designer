var isObject = require('lodash.isobject');
var globject = require('globject');
var pathematics = require('pathematics');
var toxic = require('toxic');
var slasher = require('glob-slasher');
var isUrl = require('is-url');

module.exports = function (redirectRouteMap) {
  
  return function (req, res, next) {
    
    var statusCode = 301;
    var normalizedRedirects = slasher(redirectRouteMap);
    var redirects = globject(normalizedRedirects);
    var redirectUrl = redirects(req.url);
    var redirectObj;
    
    // redirect with segments
    if (!redirectUrl) {
      var parsedUrl = pathematics.withMeta(normalizedRedirects, req.url);
      redirectUrl = parsedUrl.url;
      statusCode = (parsedUrl.meta && parsedUrl.meta.status) ? parsedUrl.meta.status : statusCode;
    }
    
    // redrect from config object
    if (isObject(redirectUrl)) {
      redirectObj = redirectUrl;
      redirectUrl = redirectObj.url;
      statusCode = redirectObj.status || statusCode;
    }
    
    if (!redirectUrl) {
      return next();
    }
    
    // Remove leading slash of a url
    redirectUrl = formatExternalUrl(redirectUrl);
    
    res.writeHead(statusCode, {Location: redirectUrl});
    res.end();
  };
};

function formatExternalUrl (u) {
  
  var cleaned = u
    .replace('/http:/', 'http://')
    .replace('/https:/', 'https://');
  
  return (isUrl(cleaned)) ? cleaned : u;
}