var pathetic = require('pathetic');
var reverend = require('reverend');

var pathematics = module.exports = function (map, url) {
  var parse = function (url) {
    var segment = parse._getSegement(map, url);
    return replaceSegments(segment);
  }
  
  function replaceSegments (segment) {
    var url = reverend(segment.value, segment.params);
    
    return (url === '') ? undefined : url;
  }
  
  parse.withMeta = function (url) {
    var segment = parse._getSegement(map, url);
    var parsedUrl = replaceSegments(segment);
    
    return (!parsedUrl) ? {} : {
      url: reverend(segment.value, segment.params),
      meta: segment._originalValue
    }
  };
  
  parse._getSegement = function (map, url) {
    var data = pathetic(map);
    var segment = data(url);
    var originalSegmentValue;
    
    // TODO: test having no segment
    if (!segment) return {
      value: '',
      params: {}
    }; 
    
    // Parse object
    if (typeof segment.value !== 'string') {
      originalSegmentValue = segment.value
      segment.value = originalSegmentValue.url;
      segment._originalValue = originalSegmentValue;
    }
    
    return segment;
  };
  
  return (url) ? parse(url) : parse;
};

pathematics.withMeta = function (map, url) {
  var parse = pathematics(map);
  return parse.withMeta(url);
};