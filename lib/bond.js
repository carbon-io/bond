var Module = require('module')

/*******************************************************************************
 * resolve
 */
function resolve(path, mod) { // XXX this is ineffecient. must cache
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
