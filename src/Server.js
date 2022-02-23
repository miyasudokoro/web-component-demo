
const https = require( 'https' );
const fs = require( 'fs' );
const path = require( 'path' );
const mime = require( 'mime-types' );

const STATUS_TEXT = {
    200: 'OK',
    401: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
};
const FAKE_ACCESS_TOKEN = 'my-fake-token';

/** @class Server
 * @description A server
 */
class Server {
    /** Constructor */
    constructor( host = 'localhost', port = '3000' ) {
        this.initialize( host, port );
    }

    /** Auto-starts a Server instance if the command-line arguments support it.
     *
     * @returns {Server}
     */
    static autoStart() {
        if ( process.argv.find( arg => arg.includes( 'Server.js' ) ) ) {
            return new Server( Server.extractArg( 'host' ), Server.extractArg( 'port' ) );
        }
    }

    /** Extracts an argument from process.argv.
     * Note: this is a super basic implementation.
     *
     * @param name {string} name of argument
     */
    static extractArg( name ) {
        const argv = process.argv;
        const index = argv.findIndex( arg => arg === '--' + name );
        if ( index > -1 ) {
            if ( !argv[ index + 1 ] || argv[ index + 1 ].startsWith( '--' ) ) {
                // boolean
                return true;
            }
            // string
            return argv[ index + 1 ];
        }
    }

    /** Initializes the server instance.
     *
     * @param host {string} the name of the host
     * @param port {string} the port number to use
     */
    initialize( host, port ) {
        this.createLogFileStream();
        this.createProcessListeners();
        this.createServer( host, port );
    }

    /** Creates the log file stream.
     *
     */
    createLogFileStream() {
        const logFile = path.join( __dirname, `/log/${new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '' )}.log` );
        this.logger = fs.createWriteStream( logFile, {
            flags: 'a'
        } );
        this.logger.on( 'error', e => console.error( e ) );
    }

    /** Creates listeners for the process events.
     *
     */
    createProcessListeners() {
        process.on( 'exit', code => {
            this.log( 'Exit: ' + code );
            this.logger.end();
        } );
        process.on( 'uncaughtException', e => {
            this.error( 'Uncaught Exception: ', e );
            process.exit( 1 );
        } );
        // needed for Windows
        process.on( 'SIGINT', () => {
            process.exit();
        } );
    }

    /** Creates the server instance.
     *
     * @param host {string} the name of the host
     * @param port {string} the port number to use
     */
    createServer( host, port ) {
        const portNumber = parseInt( port );
        const options = {
            key: fs.readFileSync( path.join( __dirname, 'certs', 'ca.key' ) ),
            cert: fs.readFileSync( path.join( __dirname, 'certs', 'ca.crt' ) )
        };
        const server = https.createServer( options, ( request, response ) => this.processRequest( request, response ) );
        this.origin = `https://${ host }:${ port }`;
        server.listen( portNumber, host, () => {
            this.log( `Server is running on ${this.origin}` );
        } );
    }

    /** Processes incoming requests.
     *
     * @param request {IncomingMessage} the request
     * @param response {ServerResponse} the response
     */
    processRequest( request, response ) {
        if ( request.method === 'GET' ) {
            const pathName = this.getPathName( request );
            return this.servePublicFile( pathName, response )
                .catch( () => this.servePrivateFile( pathName, response, request ) )
                .catch( e => this.serveError( pathName, response, e ) );
        } else if ( request.method === 'POST' ) {
            let body = '';

            request.on( 'data', chunk => ( body += chunk ) );

            request.on( 'end', () => {
                switch ( request.url ) {
                    case '/login':
                        this.logIn( body, request, response );
                        break;
                }
            } );
        }
    }

    /** Gets the path name from the request.
     *
     * @param request {IncomingMessage} the request
     * @returns {string}
     */
    getPathName( request ) {
        let pathName = request.url;
        const isPage = pathName.startsWith( '/page' );
        if ( pathName.endsWith( '/' ) ) {
            pathName += isPage ? 'index.htm' : 'index.html';
        } else if ( isPage ) {
            pathName += '.htm';
        }
        return pathName;
    }

    /** Serves a file that is protected by user authorization.
     *
     * @param pathName {string} the requested path name
     * @param response {ServerResponse} the response
     * @returns {Promise}
     */
    servePublicFile( pathName, response ) {
        const fullPathName = path.join( __dirname, 'public', pathName );
        return fs.promises.readFile( fullPathName )
            .then( data => this.respond( response, 200, fullPathName, data ) );
    }

    /** Serves a file that is protected by user authorization.
     *
     * @param pathName {string} the requested path name
     * @param response {ServerResponse} the response
     * @param request {IncomingMessage} the request
     * @returns {Promise}
     */
    servePrivateFile( pathName, response, request ) {
        const auth = request.headers.authorization;
        const fullPathName = path.join( __dirname, 'private', pathName );
        return fs.promises.readFile( fullPathName )
            .then( data => {
                return this.checkTokenWithAuthorizationProvider( auth )
                    .then( () => this.respond( response, 200, fullPathName, data ) );
            } );
    }

    /** Serves an error response.
     *
     * @param pathName {string} the requested path name
     * @param response {ServerResponse} the response instance
     * @param error {Error} the error
     */
    serveError( pathName, response, error ) {
        if ( error.code === 'ENOENT' ) {
            return this.respond( response, 404, pathName );
        } else if ( error.status ) {
            return this.respond( response, error.status, pathName );
        }
        this.error( error );
        return this.respond( response, 500, pathName );
    }

    /** Logs in with the authorization provider.
     *
     * @param body {string} the request body
     * @param request {IncomingMessage} the request
     * @param response {ServerResponse} the response
     */
    logIn( body, request, response ) {
        // obviously, this is not a real authorization provider :)
        const parsed = JSON.parse( body );
        if ( parsed.username === 'my-username' && parsed.password === 'fake1234' ) {
            return this.respond( response, 200, 'login.json', JSON.stringify( {
                'access_token': FAKE_ACCESS_TOKEN
            } ) );
        }
        return this.respond( response, 403, 'login.json', JSON.stringify( {
            messageKey: 'error.400'
        } ) );
    }

    /** Checks the authorization header against an authorization provider.
     *
     * @param authorization {string} the authorization header value
     * @returns {Promise} resolves if the user is authorized
     */
    checkTokenWithAuthorizationProvider( authorization ) {
        // obviously, this is not a real authorization provider :)
        return new Promise( ( resolve, reject ) => {
            if ( authorization ) {
                const [ , token ] = authorization.split( ' ' );
                if ( token === FAKE_ACCESS_TOKEN ) {
                    return resolve();
                }
            }
            const error = new Error( STATUS_TEXT[ 401 ] );
            error.status = 401;
            reject( error );
        } );
    }

    /** Logs messages.
     *
     * @param args {...any} things to log
     */
    log( ...args ) {
        console.log( ...args );
        this._writeLog( ...args );
    }

    /** Logs errors.
     *
     * @param args {...any} things to log
     */
    error( ...args ) {
        console.error( ...args );
        this._writeLog( 'ERROR', ...args );
    }

    /** Writes to the log file.
     *
     * @param args {...any} things to log
     * @private
     */
    _writeLog( ...args ) {
        if ( this.logger.writable ) {
            args.forEach( arg => {
                if ( arg instanceof Error ) {
                    this.logger.write( arg.stack + '\n' );
                } else if ( arg && typeof arg === 'object' ) {
                    this.logger.write( JSON.stringify( arg, null, 2 ) + '\n' );
                } else {
                    this.logger.write( arg + '\n' );
                }
            } );
        }
    }

    /** Generates appropriate headers.
     *
     * @param status {number} the status code
     * @param fullPathName {string} the file path
     * @param [data] {Buffer} the data to write
     * @returns {object} record of headers
     */
    generateHeaders( status, fullPathName, data ) {
        const headers = {
            'Access-Control-Allow-Origin': this.origin
        };
        if ( data ) {
            const type = mime.lookup( path.basename( fullPathName ) );
            headers[ 'Content-Type' ] = type;
        }
        // in a real application, you need to figure out your caching; we'll just turn it off for this prototype
        headers[ 'Cache-Control' ] = 'no-store';
        return headers;
    }

    /** Responds to a request.
     *
     * @param response {ServerResponse} the http response
     * @param status {number} the status code
     * @param fullPathName {string} the file path
     * @param [data] {Buffer|string} the data to write
     */
    respond( response, status, fullPathName, data ) {
        if ( status > 299 ) {
            this.log( status, fullPathName );
        }
        const headers = this.generateHeaders( status, fullPathName, data );
        response.writeHead( status, STATUS_TEXT[ status ] || 'Unknown', headers );
        data && response.write( data, 'utf8' );
        response.end();
    }
}

Server.autoStart();

module.exports = Server;
