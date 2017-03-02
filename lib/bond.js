var Module = require('module')

var CarbonClient = require('@carbon-io/carbon-client-node')

var errors = require('./errors')

/*******************************************************************************
 * PRIVATE_ENV
 */
var PRIVATE_ENV = "__privateEnv"

/*******************************************************************************
 * resolve
 */
function resolve(path, options, mod) {
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
      } else {
        throw new Error("Unable to resolve path: '" + path + "'. Unknown namespace: " + namespace)  
      }
    }
  }
}

/*******************************************************************************
 * resolveEnv
 */
function resolveEnv(path, options, mod) {
  var result = undefined
  if (path) {
    result = (process[PRIVATE_ENV] && process[PRIVATE_ENV][path]) || process.env[path]
  }

  return result
}

/*******************************************************************************
 * resolveHttp
 */
function resolveHttp(path, options, mod) {
  return new CarbonClient(path, options)
}

/*******************************************************************************
 * resolveModule
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

/*******************************************************************************
 * resolveFilename
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

/*******************************************************************************
 * _o
 */
function _o(mod) {
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to _o: " + mod))
  } 
  return function(path, options) {
    return resolve(path, options, mod)
  }
}

/*******************************************************************************
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
