var parsers = require('./');

parsers.register('json', function(data) {
  return require(data);
});
