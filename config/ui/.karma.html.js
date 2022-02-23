const base = require( '../.karma.base.js' );
const path = require( 'path' );

const settings = {
    ...base,
    htmlDetailed: {
        dir: path.join( process.cwd(), 'reports/unit/ui' ),
        splitResults: false,
        autoReload: false,
        useHostedBootstrap: true
    },
    plugins: [ ...base.plugins, 'karma-html-detailed-reporter' ],
    reporters: [ ...base.reporters, 'htmlDetailed' ],
}

module.exports = function( config ) {
    config.set( settings )
};
