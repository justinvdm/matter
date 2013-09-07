var fs = require('fs');
var _ = require('underscore');
var parsers = exports;

var re = {};
re.unwantedWhitespace = /(^\s\+)||(\s\+$)/g;

parsers.defaults = {};
parsers.defaults.indicator = /[-]\+\n/;
parsers.defaults.ignore = new RegExp([
  '(\\/\\/)',
  '(\\/\\*)',
  '(\\*\\/)',
  '(#)'
].join('|'));

parsers.extract = function(data, options) {
  options = _(options || {}).defaults(parsers.defaults);

  if (!options.indicators) {
    options.indicators = {
      head: options.indicator,
      tail: options.indicator
    };
  }

  // chop off the parts that don't 'matter' (that was lame :)
  var headMatch = data.match(options.indicators.head);
  data = data.slice(headMatch.index + headMatch[0]);

  var tailMatch = data.match(options.indicators.tail);
  data = data.slice(0, tailMatch.index);

  // strip out unwanted characters
  data = data
    .replace(options.ignore, '')
    .replace(re.unwantedWhitespace, '');

  return data;
};

parsers.make = function(fn) {
  var parser = function(data, options) {
    options = options || {};
    data = parsers.extract(data, options);
    return fn(data);
  };

  parser.inFile = function(filename, options, done) {
    options = options || {};
    fs.readFile(filename, options, function(err, data) {
      if (!err) { done(null, parser(data, options)); }
      else done(err);
    });
  };

  return parser;
};
