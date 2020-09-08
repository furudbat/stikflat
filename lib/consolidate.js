/*global Promise, exports, require, module */
'use strict';
/*
 * When an engine compiles to a `Function`,
 * these functions should either be cached within consolidate.js
 * or the engine itself via `options._cache`. This will allow
 * users and frameworks to pass `options.cache = true` for
 * `NODE_ENV=production`, however edit the file(s) without
 * re-loading the application in development.
 */

/**
 * Module dependencies.
 */
/// use ES6
//var Promise = require('bluebird');

/**
 * Require cache.
 */

var cacheStore = {};

/**
 * Require cache.
 */

var requires = {};

/**
 * Clear the cache.
 *
 * @api public
 */

exports.clearCache = function() {
  cacheStore = {};
};

/**
 * Conditionally cache `compiled` template based
 * on the `options` `._id` and `._cache` boolean.
 *
 * @param {Object} options
 * @param {Function} compiled
 * @return {Function}
 * @api private
 */

function cache(options, compiled) {
  // cachable
  if (compiled && options._id && options._cache) {
    cacheStore[options._id] = compiled;
    return compiled;
  }

  // check cache
  if (options._id && options._cache) {
    return cacheStore[options._id];
  }

  return compiled;
}

/**
 * promisify
 */
function promisify(cb, fn) {
  return new Promise(function(resolve, reject) {
    cb = cb || function(err, html) {
      if (err) {
        return reject(err);
      }
      resolve(html);
    };
    fn(cb);
  });
}

/**
 * fromStringRenderer
 */

function fromStringRenderer(name) {
  return function(str, options, cb) {
    return promisify(cb, function(cb) {
        var extend = (requires.extend || (requires.extend = require('util')._extend));
        var opts = extend({}, options);
        if (cache(opts)) {
          exports[name].render('', opts, cb);
        } else {
          exports[name].render(str, opts, cb);
        }
    });
  };
}

/**
 * velocity support.
 */

exports.velocityjs = fromStringRenderer('velocityjs');

/**
 * velocity string support.
 */

exports.velocityjs.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.velocityjs || (requires.velocityjs = require('velocityjs'));
    try {
      options.locals = options;
      cb(null, engine.render(str, options).trimLeft());
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Jade support.
 */

exports.jade = function(path, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.jade;
    if (!engine) {
      try {
        engine = requires.jade = require('jade');
      } catch (err) {
        try {
          engine = requires.jade = require('then-jade');
        } catch (otherError) {
          throw err;
        }
      }
    }

    try {
      var tmpl = cache(options) || cache(options, engine.compileFile(path, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Jade string support.
 */

exports.jade.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.jade;
    if (!engine) {
      try {
        engine = requires.jade = require('jade');
      } catch (err) {
        try {
          engine = requires.jade = require('then-jade');
        } catch (otherError) {
          throw err;
        }
      }
    }

    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Swig support.
 */

exports.swig = fromStringRenderer('swig');

/**
 * Swig string support.
 */

exports.swig.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.swig;
    if (!engine) {
      try {
        engine = requires.swig = require('swig');
      } catch (err) {
        try {
          engine = requires.swig = require('swig-templates');
        } catch (otherError) {
          throw err;
        }
      }
    }

    try {
      if (options._cache === true) options._cache = 'memory';
      engine.setDefaults({ cache: options._cache });
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Atpl support.
 */

exports.atpl = fromStringRenderer('atpl');

/**
 * Atpl string support.
 */

exports.atpl.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.atpl || (requires.atpl = require('atpl'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Liquor support,
 */

exports.liquor = fromStringRenderer('liquor');

/**
 * Liquor string support.
 */

exports.liquor.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.liquor || (requires.liquor = require('liquor'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * EJS support.
 */

exports.ejs = fromStringRenderer('ejs');

/**
 * EJS string support.
 */

exports.ejs.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.ejs || (requires.ejs = require('ejs'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Eco support.
 */

exports.eco = fromStringRenderer('eco');

/**
 * Eco string support.
 */

exports.eco.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.eco || (requires.eco = require('eco'));
    try {
      cb(null, engine.render(str, options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Jazz support.
 */

exports.jazz = fromStringRenderer('jazz');

/**
 * Jazz string support.
 */

exports.jazz.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.jazz || (requires.jazz = require('jazz'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      tmpl.eval(options, function(str) {
        cb(null, str);
      });
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * JQTPL support.
 */

exports.jqtpl = fromStringRenderer('jqtpl');

/**
 * JQTPL string support.
 */

exports.jqtpl.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.jqtpl || (requires.jqtpl = require('jqtpl'));
    try {
      engine.template(str, str);
      cb(null, engine.tmpl(str, options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Haml support.
 */

exports.haml = fromStringRenderer('haml');

/**
 * Haml string support.
 */

exports.haml.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.haml || (requires.haml = require('hamljs'));
    try {
      options.locals = options;
      cb(null, engine.render(str, options).trimLeft());
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Hamlet support.
 */

exports.hamlet = fromStringRenderer('hamlet');

/**
 * Hamlet string support.
 */

exports.hamlet.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.hamlet || (requires.hamlet = require('hamlet'));
    try {
      options.locals = options;
      cb(null, engine.render(str, options).trimLeft());
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Whiskers support.
 */

exports.whiskers = function(path, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.whiskers || (requires.whiskers = require('whiskers'));
    engine.__express(path, options, cb);
  });
};

/**
 * Whiskers string support.
 */

exports.whiskers.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.whiskers || (requires.whiskers = require('whiskers'));
    try {
      cb(null, engine.render(str, options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Hogan support.
 */

exports.hogan = fromStringRenderer('hogan');

/**
 * Hogan string support.
 */

exports.hogan.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.hogan || (requires.hogan = require('hogan.js'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl.render(options, options.partials));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * templayed.js support.
 */

exports.templayed = fromStringRenderer('templayed');

/**
 * templayed.js string support.
 */

exports.templayed.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.templayed || (requires.templayed = require('templayed'));
    try {
      var tmpl = cache(options) || cache(options, engine(str));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Handlebars support.
 */

exports.handlebars = fromStringRenderer('handlebars');

/**
 * Handlebars string support.
 */

exports.handlebars.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.handlebars || (requires.handlebars = require('handlebars'));
    try {
      for (var partial in options.partials) {
        engine.registerPartial(partial, options.partials[partial]);
      }
      for (var helper in options.helpers) {
        engine.registerHelper(helper, options.helpers[helper]);
      }
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Underscore support.
 */

exports.underscore = fromStringRenderer('underscore');

/**
 * Underscore string support.
 */

exports.underscore.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.underscore || (requires.underscore = require('underscore'));
    try {
      const partials = {};
      for (var partial in options.partials) {
        partials[partial] = engine.template(options.partials[partial]);
      }
      options.partials = partials;
      var tmpl = cache(options) || cache(options, engine.template(str, null, options));
      cb(null, tmpl(options).replace(/\n$/, ''));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Lodash support.
 */

exports.lodash = fromStringRenderer('lodash');

/**
 * Lodash string support.
 */

exports.lodash.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.lodash || (requires.lodash = require('lodash'));
    try {
      var tmpl = cache(options) || cache(options, engine.template(str, options));
      cb(null, tmpl(options).replace(/\n$/, ''));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Pug support. (formerly Jade)
 */

exports.pug = function(path, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.pug;
    if (!engine) {
      try {
        engine = requires.pug = require('pug');
      } catch (err) {
        try {
          engine = requires.pug = require('then-pug');
        } catch (otherError) {
          throw err;
        }
      }
    }

    try {
      var tmpl = cache(options) || cache(options, engine.compileFile(path, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Pug string support.
 */

exports.pug.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.pug;
    if (!engine) {
      try {
        engine = requires.pug = require('pug');
      } catch (err) {
        try {
          engine = requires.pug = require('then-pug');
        } catch (otherError) {
          throw err;
        }
      }
    }

    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * QEJS support.
 */

exports.qejs = fromStringRenderer('qejs');

/**
 * QEJS string support.
 */

exports.qejs.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    try {
      var engine = requires.qejs || (requires.qejs = require('qejs'));
      engine.render(str, options).then(function(result) {
        cb(null, result);
      }, function(err) {
        cb(err);
      }).done();
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Mustache support.
 */

exports.mustache = fromStringRenderer('mustache');

/**
 * Mustache string support.
 */

exports.mustache.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.mustache || (requires.mustache = require('mustache'));
    try {
      cb(null, engine.render(str, options, options.partials));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Just support.
 */

exports.just = function(path, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.just;
    if (!engine) {
      var JUST = require('just');
      engine = requires.just = new JUST();
    }
    engine.configure({ useCache: options.cache });
    engine.render(path, options, cb);
  });
};

/**
 * Just string support.
 */

exports.just.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var JUST = require('just');
    var engine = new JUST({ root: { page: str }});
    engine.render('page', options, cb);
  });
};

/**
 * ECT support.
 */

exports.ect = function(path, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.ect;
    if (!engine) {
      var ECT = require('ect');
      engine = requires.ect = new ECT(options);
    }
    engine.configure({ cache: options._cache });
    engine.render(path, options, cb);
  });
};

/**
 * ECT string support.
 */

exports.ect.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var ECT = require('ect');
    var engine = new ECT({ root: { page: str }});
    engine.render('page', options, cb);
  });
};

/**
 * mote support.
 */

exports.mote = fromStringRenderer('mote');

/**
 * mote string support.
 */

exports.mote.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.mote || (requires.mote = require('mote'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * doT support.
 */

exports.dot = fromStringRenderer('dot');

/**
 * doT string support.
 */

exports.dot.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.dot || (requires.dot = require('dot'));
    var extend = (requires.extend || (requires.extend = require('util')._extend));
    try {
      var settings = {};
      settings = extend(settings, engine.templateSettings);
      settings = extend(settings, options ? options.dot : {});
      var tmpl = cache(options) || cache(options, engine.template(str, settings, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * bracket support.
 */

exports.bracket = fromStringRenderer('bracket');

/**
 * bracket string support.
 */

exports.bracket.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.bracket || (requires.bracket = require('bracket-template'));
    try {
      var tmpl = cache(options) || cache(options, engine.default.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Ractive support.
 */

exports.ractive = fromStringRenderer('ractive');

/**
 * Ractive string support.
 */

exports.ractive.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var Engine = requires.ractive || (requires.ractive = require('ractive'));

    var template = cache(options) || cache(options, Engine.parse(str));
    options.template = template;

    if (options.data === null || options.data === undefined) {
      var extend = (requires.extend || (requires.extend = require('util')._extend));

      // Shallow clone the options object
      options.data = extend({}, options);

      // Remove consolidate-specific properties from the clone
      var i;
      var length;
      var properties = ['template', '_cache', 'partials'];
      for (i = 0, length = properties.length; i < length; i++) {
        var property = properties[i];
        delete options.data[property];
      }
    }

    try {
      cb(null, new Engine(options).toHTML());
    } catch (err) {
      cb(err);
    }
  });
};

/**
* Plates Support.
*/

exports.plates = fromStringRenderer('plates');

/**
* Plates string support.
*/

exports.plates.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.plates || (requires.plates = require('plates'));
    var map = options.map || undefined;
    try {
      var tmpl = engine.bind(str, options, map);
      cb(null, tmpl);
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Vash support
 */
exports.vash = fromStringRenderer('vash');

/**
 * Vash string support
 */
exports.vash.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.vash || (requires.vash = require('vash'));

    try {
      // helper system : https://github.com/kirbysayshi/vash#helper-system
      if (options.helpers) {
        for (var key in options.helpers) {
          if (!options.helpers.hasOwnProperty(key) || typeof options.helpers[key] !== 'function') {
            continue;
          }
          engine.helpers[key] = options.helpers[key];
        }
      }

      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      tmpl(options, function sealLayout(err, ctx) {
        if (err) cb(err);
        ctx.finishLayout();
        cb(null, ctx.toString().replace(/\n$/, ''));
      });
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Slm support.
 */

exports.slm = fromStringRenderer('slm');

/**
 * Slm string support.
 */

exports.slm.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.slm || (requires.slm = require('slm'));

    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      cb(null, tmpl(options));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * Squirrelly support.
 */

exports.squirrelly = fromStringRenderer('squirrelly');

/**
 * Squirrelly string support.
 */

exports.squirrelly.render = function(str, options, cb) {
  return promisify(cb, function(cb) {
    var engine = requires.squirrelly || (requires.squirrelly = require('squirrelly'));
    try {
      for (var partial in options.partials) {
        engine.definePartial(partial, options.partials[partial]);
      }
      for (var helper in options.helpers) {
        engine.defineHelper(helper, options.helpers[helper]);
      }
      var tmpl = cache(options) || cache(options, engine.Compile(str, options));
      cb(null, tmpl(options, engine));
    } catch (err) {
      cb(err);
    }
  });
};

/**
 * expose the instance of the engine
 */
exports.requires = requires;