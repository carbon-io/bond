var assert = require('assert')

var sinon = require('sinon')

var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)
var testtube = require('@carbon-io/test-tube')

var _o = require('..')._o(module)
var errors = require('../lib/errors')

NODE_VERSION = parseInt(process.version.match(/v(\d+)\.\d+\.\d+/)[1])

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'resolveModuleTests',
    description: 'resolveModule tests',
    tests: [
      o({
        _type: testtube.Test,
        name: 'ResolveModuleWithSyntaxErrorTest',
        description: 'Resolve a module with a syntax error and validate error object',
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
        description: 'Resolve a module with a syntax error in nested calls to _o and validate error object',
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
      o({
        _type: testtube.Test,
        name: 'ResolveModuleWithRequiredNestedSyntaxErrorTest',
        description: 'Resolve a module with a syntax error being required in nested _o calls and validate error object',
        doTest: function() {
          assert.throws(function() {
            var mod = _o('./fixtures/requiredNestedSyntaxError')
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
        name: 'ResolveModuleWithUnsupportedLanguageConstructs',
        description: 'Resolve a module with language features that are not supported in this version of node',
        setup: function() {
          if (NODE_VERSION > 4) {
            throw new testtube.errors.SkipTestError('Only run in node 4')
          }
        },
        doTest: function() {
          assert.throws(function() {
            var mod = _o('./fixtures/esVersionMismatch')
          }, function(err) {
            assert(err.error instanceof SyntaxError)
            assert(err instanceof SyntaxError)
            assert(err instanceof errors.ResolveModuleSyntaxError)
            assert.equal(err.lineNumber, -1)
            assert.equal(err.columnNumber, -1)
            assert(typeof err.ecmaVersion === 'undefined')
            return true
          })
        }
      }),
    ]
  })
})

