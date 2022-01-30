const base = require( '../.mocharc.base.json' );

module.exports = {
    ...base,
    reporter: 'mocha-junit-reporter',
    reporterOption: [
        'useFullSuiteTitle=true',
        'includePending=true',
        'toConsole=true',
        'testCaseSwitchClassnameAndName=true',
        'mochaFile=./reports/xml/TESTS-node.xml'
    ]
};
