var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var re = {};
re.leadingNewlines = /^\n+/;
re.trailingWhitespace = /\s+$/;
re.trailingLineWhitespace = /\s+\n/g;
re.leadingSpace = /\ */;

var parsers = exports;

parsers.defaults = function(defaults) {
  return _(parsers.defaults).extend(defaults || {});
};

parsers.defaults.encoding = 'utf8';
parsers.defaults.indicator = /---/;
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

parsers.unindent = function(data) {
  var lines = data.split('\n');

  var indentSize = lines
    .reduce(function(min, curr) {
      if (!curr) { return min; }
      var match = curr.match(re.leadingSpace);
      return Math.min(min, match[0].length);
    }, Infinity);

  return lines
    .map(function(line) { return line.slice(indentSize); })
    .join('\n');
};

parsers.clean = function(data, options) {
  options = _(options || {}).defaults({
    ignore: parsers.defaults.ignore,
  });

  data = data
    .replace(options.ignore, '')
    .replace(re.leadingNewlines, '')
    .replace(re.trailingWhitespace, '')
    .replace(re.trailingLineWhitespace, '\n');

  return parsers.unindent(data);
};

parsers.extract = function(data, options) {
  options = _(options || {}).defaults({
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

  return parsers.clean(data, options);
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
