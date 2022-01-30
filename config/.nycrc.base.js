
const THRESHOLD = 90;

module.exports = {
    'check-coverage': true,
    'include': [ 'src/**/*.js' ],
    'exclude-node-modules': true,
    'exclude': [ 'test/**', 'unitTest/**', 'dist/**', 'reports/**' ],
    'temp-dir': './reports/.nyc_output',
    'all': true,
    'per-file': true,
    'branches': THRESHOLD,
    'lines': THRESHOLD,
    'functions': THRESHOLD,
    'statements': THRESHOLD,
    'watermarks': {
        'branches': [ THRESHOLD, Math.max( THRESHOLD + 2, 100 ) ],
        'lines': [ THRESHOLD, Math.max( THRESHOLD + 2, 100 ) ],
        'functions': [ THRESHOLD, Math.max( THRESHOLD + 2, 100 ) ],
        'statements': [ THRESHOLD, Math.max( THRESHOLD + 2, 100 ) ],
    }
}
