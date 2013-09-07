var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var parsers = exports;

parsers.defaults = function(defaults) {
  return _(parsers.defaults).extend(defaults || {});
};

parsers.defaults.encoding = 'utf8';
parsers.defaults.indicator = /-{3,}/;
parsers.defaults.ignore = new RegExp([
  '(\\/\\/)',
  '(\\/\\*)',
  '(\\*\\/)',
  '(#)'
].join('|'), 'g');

parsers.registry = {};
parsers.register = function(name, fn) {
  parsers.registry[name] = parsers.make(fn);
  return this;
};

parsers.extract = function(data, options) {
  options = _(options || {}).defaults({
    ignore: parsers.defaults.ignore,
    indicator: parsers.defaults.indicator,
    indicators: parsers.defaults.indicators
  });

  if (!options.indicators) {
    options.indicators = {
      head: options.indicator,
      tail: options.indicator
    };
  }

  // chop off the parts that don't 'matter' (that was lame :)
  var headMatch = data.match(options.indicators.head);
  data = data.slice(headMatch.index + headMatch[0].length);

  var tailMatch = data.match(options.indicators.tail);
  data = data.slice(0, tailMatch.index);

  // strip out unwanted characters
  data = data.replace(options.ignore, '');

  return data;
};

parsers.make = function(fn) {
  var parser = function(data, options) {
    options = options || {};
    data = parsers.extract(data, options);
    return fn(data);
  };

  parser.inFile = function(filename, options, done) {
    if (arguments.length < 3) {
      done = options;
      options = {};
    }

    options = _(options || {}).defaults({
      encoding: parsers.defaults.encoding
    });

    fs.readFile(path.resolve(filename), options, function(err, data) {
      if (!err) { done(err, parser(data, options)); }
      else done(err);
    });
  };

  return parser;
};
