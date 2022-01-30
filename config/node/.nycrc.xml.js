const base = require( '../.nycrc.base.js' );

module.exports = {
    ...base,
    'reporter': 'cobertura',
    'report-dir': './reports/xml'
}
