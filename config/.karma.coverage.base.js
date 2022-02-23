
const nycrc = require( './.nycrc.base.js' );

module.exports = function( baseFn ) {
    let base;
    baseFn( {
        set: b => ( base = b )
    } );

    const preprocessors = {};
    const include = [];

    // apply code coverage to the source code files
    base.customFields.sources.forEach( fileSelection => {
        if ( typeof fileSelection === 'string' ) {
            preprocessors[ fileSelection ] = [ 'coverage' ];
            include.push( fileSelection );
        } else {
            preprocessors[ fileSelection.pattern ] = [ 'coverage' ];
            include.push( fileSelection.pattern );
        }
    } );

    return {
        ...base,
        preprocessors,
        plugins: [ ...base.plugins, 'karma-coverage' ],
        reporters: [ ...base.reporters, 'coverage' ],
        coverageReporter: {
            ...nycrc,
            include,
            includeAllSources: nycrc.all,
            check: {
                each: {
                    branches: nycrc.branches,
                    lines: nycrc.lines,
                    statements: nycrc.statements,
                    functions: nycrc.functions
                },
            },
            instrumenterOptions: {
                'istanbul': {
                    esModules: true
                }
            }
        }
    }
}
