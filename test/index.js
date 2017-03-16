var o = require('@carbon-io/atom').o(module).main
var testtube = require('@carbon-io/test-tube')

var bondTests = o({
  _type: testtube.Test,
  name: 'BondTests',
  description: 'Bond tests',
  tests: [require('./resolveModuleTests')]
})

module.exports = bondTests

