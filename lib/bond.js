var Module = require('module')

/*******************************************************************************
 * PRIVATE_ENV
 */
var PRIVATE_ENV = "__carbonenv"

/*******************************************************************************
 * resolve
 */
function resolve(path, mod) {
  if (path) {
    var i = path.indexOf(':') 
    if (i === -1) {
      return resolveModule(path, mod)
    } else {
      var namespace = path.substring(0, i)
      var p = path.substring(i + 1)
      if (namespace === "env") {
        return resolveEnv(p, mod)
      } else {
        throw new Error("Unable to resolve path: '" + path + "'. Unknown namespace: " + namespace)  
      }
    }
  }
}

/*******************************************************************************
 * resolveEnv
 */
function resolveEnv(path, mod) {
  var result = undefined
  
  if (path) {
    result = process.env[path]
    if (result) {
      // If "private" move out of env for security
      if (path.indexOf('_') === 0) {
        // remove
        delete process.env[path]
        // place in private env (another, hidden filed of process)
        if (!process[PRIVATE_ENV]) {
          process[PRIVATE_ENV] = {}
        }
        process[PRIVATE_ENV][path] = result
      }
    } else {
      // look in private env
      if (process[PRIVATE_ENV]) {
        result = process[PRIVATE_ENV][path]
      }
    }
  }

  return result
}

/*******************************************************************************
 * resolveModule
 */
function resolveModule(path, mod) { // XXX this is ineffecient. must cache
  var result = null
  var filepath = resolveFilename(path, mod)
  result = mod.require(filepath)
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
  return function(path, args) {
    return resolve(path, mod)
  }
}

/*******************************************************************************
 * exports
 */
module.exports = _o

module.exports._o = _o // XXX might want to decide
