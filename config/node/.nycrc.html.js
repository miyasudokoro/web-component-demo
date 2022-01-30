const base = require( '../.nycrc.base.js' );

module.exports = {
    ...base,
    'reporter': 'html',
    'report-dir': './reports/coverage/node'
}
