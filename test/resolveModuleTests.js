var assert = require('assert')

var o = require('@carbon-io/atom').o(module).main
var testtube = require('@carbon-io/test-tube')

var _o = require('..')._o(module)

var resolveModuleTests = o({
  _type: testtube.Test,
  name: 'resolveModuleTests',
  description: 'resolveModule tests',
  tests: [
    o({
      _type: testtube.Test,
      name: 'ResolveModuleWithSyntaxErrorTest',
      description: 'resolve a module with a syntax error and validate error object',
      doTest: function() {
        assert.throws(function() {
          var mod = _o('./fixtures/syntaxError')
        }, function(err) {
          assert(err.error instanceof SyntaxError)
          assert.equal(err.lineNumber, 4)
          assert.equal(err.columnNumber, 8)
          assert(err.message.match(/.+\/fixtures\/syntaxError\.js:4/) !== null)
          return true
        })
      }
    }),
  ]
})

module.exports = resolveModuleTests

