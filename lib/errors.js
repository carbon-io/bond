var fs = require('fs')
var util = require('util')

var checkSyntax = require('syntax-error')

function ResolveModuleSyntaxError(error, filepath) {
  var syntaxErr = checkSyntax(fs.readFileSync(filepath), filepath)
  this.error = error
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

