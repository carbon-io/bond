var Module = require('module')

/*******************************************************************************
 * PRIVATE_ENV
 */
var PRIVATE_ENV = "__carbonenv"

/*******************************************************************************
 * PRIVATE_ENV_PREFIX
 */
var PRIVATE_ENV_PREFIX = "__"

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
    result = process[PRIVATE_ENV][path] || process.env[path]
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
 * static startup work
 *
 * We should hide all private env variables and store in process[PRIVATE_ENV]
 */
var privateEnv = {}
process[PRIVATE_ENV] = privateEnv
for (var v in process.env) {
  if (v.indexOf(PRIVATE_ENV_PREFIX) === 0) {
    privateEnv[v] = process.env[v]
    delete process.env[v]
  }
}
//console.log(process.env)
//console.log(process[PRIVATE_ENV])

/*******************************************************************************
 * exports
 */
module.exports = _o

module.exports._o = _o // XXX might want to decide
