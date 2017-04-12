var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)
var testtube = require('@carbon-io/test-tube')

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'BondTests',
    description: 'Bond tests',
    tests: [require('./resolveModuleTests')]
  })
})
