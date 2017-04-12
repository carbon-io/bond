var assert = require('assert')

var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)
var testtube = require('@carbon-io/test-tube')

var _o = require('..')._o(module)
var errors = require('../lib/errors')

__(function() {
  module.exports = o.main({
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
            assert(err instanceof SyntaxError)
            assert(err instanceof errors.ResolveModuleSyntaxError)
            assert.equal(err.lineNumber, 4)
            assert.equal(err.columnNumber, 8)
            assert(err.message.match(/.+\/fixtures\/syntaxError\.js:4/) !== null)
            assert(err.stack.match(/.+\/fixtures\/syntaxError\.js:4/) !== null)
            return true
          })
        }
      }),
      o({
        _type: testtube.Test,
        name: 'ResolveModuleWithNestedSyntaxErrorTest',
        description: 'resolve a module with a syntax error in nested calls to _o and validate error object',
        doTest: function() {
          assert.throws(function() {
            var mod = _o('./fixtures/nestedSyntaxError')
          }, function(err) {
            assert(err.error instanceof SyntaxError)
            assert(err instanceof SyntaxError)
            assert(err instanceof errors.ResolveModuleSyntaxError)
            assert.equal(err.lineNumber, 4)
            assert.equal(err.columnNumber, 8)
            assert(err.message.match(/.+\/fixtures\/syntaxError\.js:4/) !== null)
            assert(err.stack.match(/.+\/fixtures\/syntaxError\.js:4/) !== null)
            return true
          })
        }
      }),
    ]
  })
})

