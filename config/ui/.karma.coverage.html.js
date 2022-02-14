const baseFn = require( './.karma.html.js' );
const path = require( 'path' );
const coverage = require( '../.karma.coverage.base.js' );

const settings = coverage( baseFn );

settings.coverageReporter.dir = path.join( process.cwd(), 'reports' );
settings.coverageReporter.reporters = [ {
    type: 'html',
    subdir: 'coverage'
} ];

module.exports = function( config ) {
    config.set( settings )
};
