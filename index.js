var _ = require('underscore');
var chalk = require('chalk');
var through = require('through2');

function indent(level) {
  return (new Array(level + 1)).join('  ');
}

function roundPlaces(val, places) {
  var multiplier = Math.pow(10, places);
  return Math.round(val * multiplier) / multiplier;
}

function colorize(val, colors) {
  var i = Math.floor(val / 100 * colors.length);
  i = Math.min(i, colors.length - 1);
  if(0 <= i && i < colors.length) {
    return colors[i](val);
  }

  return val;
}

/**
 * opts: {
 *   colors: [color] - The colors used to represent different coverage percentages.
 * }
 */
function coverReporter(opts) {
  var colors = opts.colors;
  if(!colors || !colors.length) {
    throw new Error('Must supply at least one color.');
  }

  colors = _.map(colors, function(color) {
    var components = color.split('.');
    return _.reduce(components, function(memo, component) {
      memo = memo[component];
      if(!memo) {
        throw new Error('Invalid chalk style!');
      }
      return memo;
    }, chalk);
  });

  function format(attr, obj, opts) {
    var prefix = opts.prefix || '';
    var suffix = opts.suffix || '';
    var width = opts.width;
    var output = '';
    var label = attr;
    if(width) {
      while(label.length < width) {
        label += ' ';
      }
    }
    output = prefix + label + ': ';
    output +=  colorize(roundPlaces(obj[attr], 2), colors) + suffix;
    return output;
  }

  return through.obj(
    function(file, encoding, callback) {
      var coverage = file.coverage;

      console.log(chalk.bold('Coverage Results'));
      console.log(indent(1), format('coverage',   coverage, {suffix: '%', width: 11}));
      console.log(indent(1), format('statements', coverage, {suffix: '%', width: 11}));
      console.log(indent(1), format('blocks',     coverage, {suffix: '%', width: 11}));
      console.log();

      _.each(coverage.files, function(file) {
        console.log(indent(1), chalk.gray('Coverage for:'), chalk.magenta(file.filename));
        console.log(indent(2), format('coverage',   file, {suffix: '%', width: 11}));
        console.log(indent(2), format('statements', file, {suffix: '%', width: 11}));
        console.log(indent(2), format('blocks',     file, {suffix: '%', width: 11}));
        console.log();
      });
      callback();
    },
  function(done) {
    done();
  });
}

module.exports = coverReporter;


