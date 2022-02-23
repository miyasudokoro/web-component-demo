const base = require( '../.karma.base.js' );
const path = require( 'path' );

const settings = {
    ...base,
    junitReporter: {
        outputDir: path.join( 'reports', 'xml' )
    },
    reporters: [ ...base.reporters, 'junit' ],
    plugins: [ ...base.plugins, 'karma-junit-reporter' ]
}

module.exports = function( config ) {
    config.set( settings )
};
