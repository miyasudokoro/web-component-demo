// dependencies: third-party files, test files, mocks, etc.
const dependencies = [
    './node_modules/sinon-chai/lib/sinon-chai.js',
    './node_modules/dirty-chai/lib/dirty-chai.js',
    {
        pattern: './test/ui.util.mjs',
        type: 'module',
        served: true,
        included: false
    },
    {
        pattern: './test/ui.setup.mjs',
        type: 'module'
    }
];

// sources: the files you are testing
const sources = [
    {
        pattern: 'src/**/*.mjs',
        type: 'module',
        served: true,
        included: false
    }
];

// tests: the test files
const tests = [ {
    pattern: 'test/ui/**/*.mjs',
    type: 'module'
} ];

// proxies: shorthand paths to get to things in your code
// if your code throws 404 for relative path not found, define a path proxy for it
const proxies = {
    '/src/': '/base/src/'
};

const CHROME_FLAGS = [
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-automation',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync'
];

const settings = {
    // these are for our own use later, not part of the normal Karma config
    customFields: {
        dependencies,
        sources,
        tests
    },

    basePath: process.cwd(),

    frameworks: [ 'mocha', 'chai', 'sinon' ],

    reporters: [ 'mocha' ],

    proxies: {
        '/node_modules/': '/base/node_modules/',
        '/test/': '/base/test/',
        ...proxies
    },

    files: dependencies
        .concat( sources )
        .concat( tests )
        .filter( a => !!a ),

    singleRun: true,
    autoWatch: false,
    usePolling: true,
    concurrency: Infinity,

    plugins: [
        'karma-mocha',
        'karma-chai',
        'karma-sinon',
        'karma-firefox-launcher',
        'karma-chrome-launcher',
        'karma-mocha-reporter'
    ],

    // this is the Karma timeout in milliseconds
    timeout: 2000,

    client: {
        requireJsShowNoTimestampsError: false,
        mocha: {
            // set this to something equal to or larger than the Karma timeout
            timeout: 3000
        }
    },

    colors: false
};

if ( process.argv.find( arg => arg === '--debug-mode' ) ) {
    // We will launch one non-headless Chrome for debugging
    settings.browsers = [ 'CustomChrome' ]
    settings.customLaunchers = {
        CustomChrome: {
            base: 'Chrome',
            flags: CHROME_FLAGS
        }
    };
} else {
    settings.browsers = [ 'HeadlessFirefox', 'HeadlessChrome' ];
    settings.customLaunchers = {
        HeadlessFirefox: {
            base: 'Firefox',
            flags: [ '-headless' ],
            prefs: {
                'app.update.service.enabled': false
            }
        },
        HeadlessChrome: {
            base: 'ChromeHeadless',
            flags: CHROME_FLAGS
        }
    };
}
module.exports = settings;
