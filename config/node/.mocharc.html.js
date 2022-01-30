const base = require( '../.mocharc.base.json' );

module.exports = {
    ...base,
    reporter: 'mochawesome',
    reporterOption: [
        'reportDir=./reports/unit/node',
        'reportFilename=index.html'
    ]
}
