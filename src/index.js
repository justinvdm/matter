var matter = exports;

matter.parsers = require('./parsers');
matter.register = matter.parsers.register;

// Have the registered parsers available directly on the api
module.exports = Object.extend(matter.parsers.registry);

// register the bundled parsers
require('./parsers/json');
require('./parsers/yaml');
