var fs = require('fs')

var Module = require('module')

var CarbonClient = require('@carbon-io/carbon-client-node')

var errors = require('./errors')

/***************************************************************************************************
 * @property PRIVATE_ENV
 * @memberof bond
 * @ignore
 */
var PRIVATE_ENV = "__privateEnv"

/***************************************************************************************************
 * @method _resolve
 * @memberof bond
 * @ignore
 */
function _resolve(path, options, mod) {
  if (path) {
    var i = path.indexOf(':')
    if (i === -1) {
      return resolveModule(path, options, mod)
    } else {
      var namespace = path.substring(0, i)
      var p = path.substring(i + 1)
      if (namespace === "env") {
        return resolveEnv(p, options, mod)
      } else if (namespace === "http" || namespace === "https") {
        return resolveHttp(path, options, mod)
      } else if (namespace === "file") {
        return resolveFile(p, options, mod)
      } else {
        throw new Error("Unable to resolve path: '" + path + "'. Unknown namespace: " + namespace)
      }
    }
  }
}

/***************************************************************************************************
 * @method resolveEnv
 * @memberof bond
 * @ignore
 */
function resolveEnv(path, options, mod) {
  var result = undefined
  if (path) {
    result = (process[PRIVATE_ENV] && process[PRIVATE_ENV][path]) || process.env[path]
  }

  return result
}

/***************************************************************************************************
 * @method resolveHttp
 * @memberof bond
 * @ignore
 */
function resolveHttp(path, options, mod) {
  return new CarbonClient(path, options)
}

/***************************************************************************************************
 * @method resolveModule
 * @memberof bond
 * @ignore
 */
function resolveModule(path, options, mod) { // XXX this is ineffecient. must cache
  var result = null
  var filepath = resolveFilename(path, mod)
  try {
    result = mod.require(filepath)
  } catch (e) {
    var error = undefined
    if (e instanceof errors.ResolveModuleSyntaxError) {
      error = e
    } else if (e instanceof SyntaxError) {
      error = new errors.ResolveModuleSyntaxError(e, filepath)
    } else {
      error = new Error("Error loading module: " + filepath + " " + e.stack)
    }
    throw error
  }
  return result
}

/***************************************************************************************************
 * @method resolveFilename
 * @memberof bond
 * @ignore
 */
function resolveFilename(path, mod) {
  var result = null;

  if (path) {
    try {
      return Module._resolveFilename(path, mod) // TODO: is this what we want?
    } catch (e) { // XXX really slows this down
      if (path && path.length > 1 && path[0] != '/') {
        pathlist = path.split('/')
        if (pathlist.length > 1) {
          if (pathlist.indexOf("lib") == -1) {
            pathlist.splice(1, 0, "lib")
            var newpath = pathlist.join('/')
            result = Module._resolveFilename(newpath, mod)
            return result
          }
        }
      }

      throw(e)
    }
  }

  return result
}

/***************************************************************************************************
 * @method resolveFile
 * @memberof bond
 * @ignore
 */
function resolveFile(path, options, mod) {
  if(path) {
    var f = Object()
    Object.defineProperties(f, {
      readStream: {
        enumerable: true,
        configurable: false,
        writeable: false,
        get: function() {
          return fs.createReadStream(path)
        }
      },
      writeStream: {
        enumerable: true,
        configurable: false,
        writeable: false,
        get: function() {
          return fs.createWriteStream(path, {flags: "a"})
        }
      },
      content: {
        enumerable: true,
        configurable: false,
        writeable: false,
        get: function() {
          return fs.readFile.sync(path).toString()
        }
      }
    })
    f.toString = function() {
      return this.content
    }
    /* open(flags[, mode][, callback])
     */
    f.open = function() {
      if(!arguments || arguments.length < 1) {
        throw(Error("flags argument is required"))
      }
      var flags = arguments[0]
      var mode = null
      var cb = null
      if(arguments.length > 2) {
        mode = arguments[1]
        cb = arguments[2]
      } else if(arguments.length > 1) {
        if(typeof arguments[1] === "number") {
          mode = arguments[1]
        } else {
          cb = arguments[1]
        }
      }
      if(cb) {
        fs.open(path, flags, mode, cb)
      } else {
        return fs.openSync(path, flags, mode)
      }
    }
    return f
  } else {
    throw(Error("File not found: "+path))
  }
}

// XXX: intentionally leaving the "file" namespace out of resolve's path parameter description since
//      it behaves differently than module resolution for relative paths

/***************************************************************************************************
 * @method resolve
 * @name resolve
 * @memberof bond
 * @description Resolves a resource. A resource can be a module, environment variable, HTTP
 *              resource, or file.
 * @param {string} path --
 *              The resource "path". By default, this is assumed to be a module and will be resolved
 *              relative to the module passed to {@link bond._o}. Environment variables should start
 *              with the scheme ``env`` (e.g., ``env:VAR``), HTTP resources should use the ``http``
 *              or ``https`` scheme (e.g., ``http://foo.com/bar``).
 * @param {Object} options --
 *              Options to pass to the underlying resolver. This is currently only supported by the
 *              HTTP resolver (``CarbonClient``)
 * @returns {*} -- The resource
 */

/***************************************************************************************************
 * @method _o
 * @memberof bond
 * @description A factory function that returns an instantiation function ``_o``
 * @param {Module} mod -- The module whose context the resulting function should execute in. This is
 *                        used to help resolve modules that are relative to ``mod``.
 * @returns {bond.resolve}
 */
function _o(mod) {
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to _o: " + mod))
  }
  return function(path, options) {
    return _resolve(path, options, mod)
  }
}

/***************************************************************************************************
 * exports
 */
module.exports = _o
module.exports._o = _o // XXX might want to decide

Object.defineProperty(module.exports, '$Test', {
  enumerable: false,
  configurable: false,
  writeable: false,
  get: function() {
    var bondTests = require('../test/index.js')
    //bondTests.tests.push(require('@carbon-io/carbon-client-node').$Test)
    var skipTest = new (require('@carbon-io/test-tube')).util.SkipTest()
    skipTest.description = "Skipping broken carbon client node tests"
    bondTests.tests.push(skipTest)
    return bondTests
  }
})
