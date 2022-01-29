
const https = require( 'https' );
const fs = require( 'fs' );
const path = require( 'path' );

// the only third-party dependency...
const mime = require( 'mime-types' );

const STATUS_TEXT = {
    200: 'OK',
    401: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
};

const staticFileCache = new Map();

/** @class Server
 * @description A server
 */
class Server {
    /** Constructor */
    constructor( host = 'localhost', port = '4000' ) {
        this.createLogFileStream();
        this.createServer( host, port );
    }

    /** Auto-starts a Server instance if the arguments support it.
     *
     * @param argv {Array<string>} process.argv
     * @returns {Server}
     */
    static autoStart( argv = process.argv ) {
        if ( argv.find( arg => arg.includes( 'Server.js' ) ) ) {
            return new Server( this.extractArg( 'host' ), this.extractArg( 'port' ) );
        }
    }

    /** Extracts an argument from process.argv.
     *
     * @param name {string} name of argument
     * @param [argv=process.argv] {Array<string>} process.argv
     */
    static extractArg( name, argv = process.argv ) {
        const index = argv.findIndex( arg => arg === '--' + name );
        if ( index > -1 ) {
            return argv[ index + 1 ];
        }
    }

    /** Clears the server-side cache.
     *
     */
    static reset() {
        staticFileCache.clear();
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
     * @param port {number} the port number to use
     */
    createServer( host, port ) {
        port = parseInt( port );
        const options = {
            key: fs.readFileSync( path.join( __dirname, 'certs', 'ca.key' ) ),
            cert: fs.readFileSync( path.join( __dirname, 'certs', 'ca.crt' ) )
        };
        this.server = https.createServer( options, ( request, response ) => this.processRequest( request, response ) );

        this.server.listen( port, host, () => {
            this.log( `Server is running on https://${host}:${port}` );
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
            return this.serveFile( path.join( __dirname, 'public', pathName ), response )
                .catch( () => this.servePrivateFile( pathName, response, request ) )
                .catch( e => this.serveError( pathName, response, e ) );
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

    /** Serves a file.
     *
     * @param fullPathName {string} the relative path
     * @param response {ServerResponse} the response instance
     * @returns {Promise}
     */
    serveFile( fullPathName, response ) {
        if ( !staticFileCache.has( fullPathName ) ) {
            staticFileCache.set( fullPathName, fs.promises.readFile( fullPathName ) );
        }
        return staticFileCache.get( fullPathName )
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
        return this.checkTokenWithAuthorizationProvider( auth )
            .then( () => this.serveFile( path.join( __dirname, 'private', pathName ), response ) );
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

    /** Checks the authorization header against an authorization provider.
     *
     * @param authorization {string} the authorization header value
     * @returns {Promise} resolves if the user is authorized
     */
    checkTokenWithAuthorizationProvider( authorization ) {
        // note: obviously, this is not a real authorization provider :)
        return new Promise( ( resolve, reject ) => {
            if ( authorization ) {
                const [ , token ] = authorization.split( ' ' );
                if ( token === 'my-fake-token' ) {
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
            args.forEach( arg => this.logger.write( JSON.stringify( arg, null, 2 ) + '\n' ) );
        }
    }

    /** Responds to a request.
     *
     * @param response {ServerResponse} the http response
     * @param status {number} the status code
     * @param pathName {string} the file path
     * @param [data] {Buffer} the data to write
     */
    respond( response, status, pathName, data ) {
        const headers = {
            'Access-Control-Allow-Origin': '*' // CORS allowed
        };
        if ( data ) {
            headers[ 'Content-Type' ] = mime.lookup( path.basename( pathName ) );
            headers[ 'Cache-Control' ] = 'Max-Age=500000';
        }
        if ( status > 299 ) {
            this.log( status, pathName );
            headers[ 'Cache-Control' ] = 'no-store';
        }
        response.writeHead( status, STATUS_TEXT[ status ] || 'Unknown', headers );
        data && response.write( data, 'utf8' );
        response.end();
    }
}

Server.autoStart();

module.exports = Server;
