var minimatch = require('minimatch');

var globject = function (map) {
  
  map = map || {};
  
  return function (val) {
    
    var keys = Object.keys(map);
    var len = keys.length;
    var globKey;
    var key;
    
    for(var i = 0; i < len; i += 1) {
      key = keys[i];
      
      if (minimatch(val, key)){
        globKey = map[key];
        break;
      }
    }
    
    return globKey;
  };
};

module.exports = globject;
