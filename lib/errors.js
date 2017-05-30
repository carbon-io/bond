var fs = require('fs')
var util = require('util')

var checkSyntax = require('syntax-error')

function ResolveModuleSyntaxError(error, filepath) {
  var syntaxErr = checkSyntax(fs.readFileSync(filepath), filepath)

  if (!syntaxErr) {
    // XXX: i'm sure this could be tightened up
    //      https://github.com/nodejs/node/issues/12383
    try {
      var U = process.binding('util')
      var arrowMessage = U.getHiddenValue(error, 'arrowMessage')
      if (arrowMessage) {
        var _filepath = U.getHiddenValue(error, 'arrowMessage').split('\n')[0]
        _filepath = _filepath.slice(0, _filepath.lastIndexOf(':'))
        syntaxErr = checkSyntax(fs.readFileSync(_filepath), _filepath)
      }
    } catch (e) {
      console.error(e)
    }
  } 

  this.error = error
  // XXX: would rather not stuff this context here, but node prints the line the
  //      error was *rethrown* on and then the stack trace when an exception goes
  //      uncaught, rather than the message + stack trace for that exception.
  //      NOTE: we could add a process.on('uncaughtException', ...) handler to
  //      do what we want in this scenario... would this be most appropriate in
  //      test-tube?
  this.stack = syntaxErr.toString() + 
               '\n\n---- original stack trace ----\n\n' + 
               error.stack
  this.message = syntaxErr.toString()
  this.lineNumber = syntaxErr.line
  this.columnNumber = syntaxErr.column
}

util.inherits(ResolveModuleSyntaxError, SyntaxError)

module.exports = {
  ResolveModuleSyntaxError: ResolveModuleSyntaxError
}

