const baseFn = require( './.karma.xml.js' );
const path = require( 'path' );
const coverage = require( '../.karma.coverage.base.js' );

const settings = coverage( baseFn );

settings.coverageReporter.dir = path.join( process.cwd(), 'reports' );
settings.coverageReporter.reporters = [ {
    type: 'cobertura',
    subdir: 'xml',
    file: 'coverage_ui.xml'
} ];

module.exports = function( config ) {
    config.set( settings )
};
