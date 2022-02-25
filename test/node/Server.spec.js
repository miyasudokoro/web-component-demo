// get the shared globals; we would include this at the top of every spec file
// so that the spec files can run individually
require( '../node.setup.js' );

// get dependencies we will need for the test cases
const rewire = require( 'rewire' );
const path = require( 'path' );
const fs = require( 'fs' );

// note the use of the "rewire" tool on our test file so we can apply global mocks
const Server = rewire( '../../src/Server.js' );

describe( 'Server.js', () => {
    let httpsMock,
        processMock,
        consoleMock,
        httpsServerMock,
        logStreamMock;

    const SRC_DIR = path.join( __dirname, '..', '..', 'src' );
    const KEY_FILE_PATH = path.join( SRC_DIR, 'certs', 'ca.key' );
    const CRT_FILE_PATH = path.join( SRC_DIR, 'certs', 'ca.crt' );
    const KEY_FILE_CONTENT = 'key file content';
    const CRT_FILE_CONTENT = 'crt file content';

    function MockResponse() {
        this.write = sinon.fake();
        this.writeHead = sinon.fake();
        this.end = sinon.fake();
    }

    beforeEach( () => {
        // the mocks are made out of sinon fakes or stubs so we can find out how they were called
        // note: for simple object types, you can use sinon.mock( ObjectType ) as a shortcut
        httpsServerMock = {
            listen: sinon.fake()
        };
        httpsMock = {
            createServer: sinon.fake.returns( httpsServerMock )
        };
        processMock = {
            on: sinon.fake(),
            exit: sinon.fake(),
            argv: []
        };
        // note: we are mocking the console to prevent cluttering the test output
        consoleMock = {
            log: sinon.fake(),
            error: sinon.fake()
        };
        logStreamMock = {
            writable: true,
            on: sinon.fake(),
            end: sinon.fake(),
            write: sinon.fake()
        };

        // When I'm using many methods of a third party in many ways, I prefer stubbing them individually
        sinon.stub( fs, 'createWriteStream' ).returns( logStreamMock );
        sinon.stub( fs, 'readFileSync' );

        // Sinon stubs are useful because you can return specific things for specific arguments
        fs.readFileSync.withArgs( KEY_FILE_PATH ).returns( KEY_FILE_CONTENT );
        fs.readFileSync.withArgs( CRT_FILE_PATH ).returns( CRT_FILE_CONTENT );

        // insert mocks using the "rewire" tool
        Server.__set__( 'https', httpsMock );
        Server.__set__( 'process', processMock );
        Server.__set__( 'console', consoleMock );
    } );

    describe( 'static extract argument', () => {
        beforeEach( () => {
            processMock.argv = [ 'node', 'something.js', '--arg1', 'blue', '--arg2', 'red', '--arg3', '--arg4', 'yellow', '--arg5' ];
        } );

        it( 'extracts first string argument', () => {
            expect( Server.extractArg( 'arg1' ) ).to.equal( 'blue' );
        } );

        it( 'extracts second string argument', () => {
            expect( Server.extractArg( 'arg2' ) ).to.equal( 'red' );
        } );

        it( 'extracts boolean in middle', () => {
            expect( Server.extractArg( 'arg3' ) ).to.equal( true );
        } );

        it( 'extracts string argument between booleans', () => {
            expect( Server.extractArg( 'arg4' ) ).to.equal( 'yellow' );
        } );

        it( 'extracts boolean at end', () => {
            expect( Server.extractArg( 'arg5' ) ).to.equal( true );
        } );

        it( 'does not extract if incorrect', () => {
            expect( Server.extractArg( 'blue' ) ).to.be.undefined();
        } );

        it( 'does not extract if missing', () => {
            expect( Server.extractArg( 'arg6' ) ).to.be.undefined();
        } );
    } );

    describe( 'static auto start', () => {
        beforeEach( () => {
            // we can stub the initialization function to prevent actual server and log streams that could become test zombies
            // as long as we test them separately, it is OK to bypass them here
            sinon.stub( Server.prototype, 'initialize' );
        } );

        it( 'does not auto start if not in arguments', () => {
            processMock.argv = [ 'node', 'something.js', '--port', '5999', '--host', 'mydomain.com' ];

            Server.autoStart();

            expect( Server.prototype.initialize ).not.to.have.been.called();
        } );

        it( 'auto starts if in arguments', () => {
            processMock.argv = [ 'node', 'Server.js', '--port', '5999', '--host', 'mydomain.com' ];

            Server.autoStart();

            expect( Server.prototype.initialize ).to.have.been.calledWith( 'mydomain.com', '5999' );
        } );
    } );

    describe( 'Server instance', () => {
        const PORT = '4444';
        const DOMAIN = 'my.domain.com';
        let server;

        beforeEach( () => {
            server = new Server( DOMAIN, PORT );
        } );

        it( 'initialized log stream', () => {
            expect( server.logger ).to.equal( logStreamMock );
            expect( fs.createWriteStream ).to.have.been.called();
            expect( fs.createWriteStream.args[ 0 ][ 1 ] ).to.deep.equal( { flags: 'a' } );
        } );

        it( 'initialized server', () => {
            sinon.stub( server, 'log' );

            expect( fs.readFileSync ).to.have.been.calledWith( KEY_FILE_PATH );
            expect( fs.readFileSync ).to.have.been.calledWith( CRT_FILE_PATH );

            expect( httpsMock.createServer ).to.have.been.calledWith( {
                key: KEY_FILE_CONTENT,
                cert: CRT_FILE_CONTENT
            }, server.processRequest );

            const [ port, domain, callback ] = httpsServerMock.listen.args[ 0 ];
            expect( port ).to.equal( 4444 );
            expect( domain ).to.equal( DOMAIN );
            callback();
            expect( server.log ).to.have.been.calledWith( `Server is running on https://${ DOMAIN }:${ PORT }` );

            expect( server.origin ).to.equal( `https://${ DOMAIN }:${ PORT }` );
        } );

        describe( 'initialized process listeners', () => {
            let eventListeners;

            beforeEach( () => {
                // here is how you can extract anonymous callback functions to test them
                // first, get the Sinon fake calls that would have registered the listeners for "process.on"
                const calls = processMock.on.args;
                // second, get the callbacks out ...
                // here, I am making an object eventListeners with structure { event: callback }
                // now I can call each of the anonymous callbacks using this object
                eventListeners = calls.reduce( ( obj, [ event, callback ] ) => {
                    obj[ event ] = callback;
                    return obj;
                }, {} );
            } );

            it( 'exit listener logs the exit code and ends the logger', () => {
                // call the anonymous callback function with any arguments you want
                eventListeners.exit( 5 );

                // test that the anonymous callback function worked
                expect( consoleMock.log ).to.have.been.calledWith( 'Exit: 5' );
                expect( logStreamMock.write ).to.have.been.calledWith( 'Exit: 5\n' );
                expect( logStreamMock.end ).to.have.been.called();
            } );

            it( 'handles uncaught exceptions', () => {
                const error = new Error( 'oops' );
                eventListeners.uncaughtException( error );

                expect( consoleMock.error ).to.have.been.calledWith( 'Uncaught Exception: ', error );
                expect( logStreamMock.write ).to.have.been.calledWith( 'ERROR\n' );
                expect( logStreamMock.write ).to.have.been.calledWith( 'Uncaught Exception: \n' );
                expect( logStreamMock.write ).to.have.been.calledWith( error.stack + '\n' );
                expect( processMock.exit ).to.have.been.calledWith( 1 );
            } );

            it( 'handles SIGINT for nice Windows exits', () => {
                eventListeners.SIGINT();
                expect( processMock.exit ).to.have.been.called();
            } );
        } );

        describe( 'processing requests', () => {

            describe( 'public HTML files', () => {
                // if tests look pretty much the same, you can use a shared code function
                function expectHTMLFile( filePath, url ) {
                    const fakeFile = Buffer.from( '<html>My HTML</html>' );
                    sinon.stub( fs.promises, 'readFile' ).resolves( fakeFile );
                    // this needs to implement the interface http.IncomingMessage
                    const request = {
                        method: 'GET',
                        url
                    };
                    // this needs to implement the interface http.ServerResponse
                    const response = new MockResponse();

                    return server.processRequest( request, response )
                        .then( () => {
                            expect( fs.promises.readFile.lastCall.firstArg ).to.equal( path.join( SRC_DIR, filePath ) );
                            expect( response.write ).to.have.been.calledWith( fakeFile, 'utf8' );
                            expect( response.writeHead ).to.have.been.calledWith( 200, 'OK', {
                                'Access-Control-Allow-Origin': server.origin,
                                'Content-Type': 'text/html',
                                'Cache-Control': 'no-store'
                            } );
                            expect( response.end ).to.have.been.called();
                        } );
                }

                it( 'gets index.html directly', () => {
                    return expectHTMLFile( 'public/index.html', '/index.html' );
                } );

                it( 'gets index.html without the file name', () => {
                    return expectHTMLFile( 'public/index.html', '/' );
                } );

                it( 'gets page template index.htm using path /page/index', () => {
                    return expectHTMLFile( 'public/page/index.htm', '/page/index' );
                } );

                it( 'gets page template index.htm using path /page/', () => {
                    return expectHTMLFile( 'public/page/index.htm', '/page/' );
                } );

                it( 'gets slide show manifest')
            } );

            describe( 'private HTML pages', () => {
                // if tests look pretty much the same, you can use a shared code function
                function expectHTMLFile( filePath, url ) {
                }

                it( 'gets a private file when authorized', () => {
                    // I will test authorization separately; this fixture assumes it is present
                    sinon.stub( server, 'checkTokenWithAuthorizationProvider' ).resolves();
                    const filePath = 'private/page/animal/gorilla.htm';
                    const url = '/page/animal/gorilla';

                    const fakeFile = Buffer.from( '<html>My HTML</html>' );
                    sinon.stub( fs.promises, 'readFile' );

                    // it tries public first
                    fs.promises.readFile.onCall( 0 ).rejects();
                    // then it tries private
                    fs.promises.readFile.onCall( 1 ).resolves( fakeFile );

                    // this needs to implement the interface http.IncomingMessage
                    const request = {
                        method: 'GET',
                        headers: {
                            authorization: 'Bearer good-token'
                        },
                        url
                    };
                    // this needs to implement the interface http.ServerResponse
                    const response = new MockResponse();

                    return server.processRequest( request, response )
                        .then( () => {
                            // it tries public first
                            expect( fs.promises.readFile.firstCall.firstArg ).to.equal( path.join( SRC_DIR, filePath.replace( 'private', 'public' ) ) );
                            // then it tries private
                            expect( fs.promises.readFile.lastCall.firstArg ).to.equal( path.join( SRC_DIR, filePath ) );
                            expect( response.write ).to.have.been.calledWith( fakeFile, 'utf8' );
                            expect( response.writeHead ).to.have.been.calledWith( 200, 'OK', {
                                'Access-Control-Allow-Origin': server.origin,
                                'Content-Type': 'text/html',
                                'Cache-Control': 'no-store'
                            } );
                            expect( response.end ).to.have.been.called();
                        } );
                } );

                it( 'returns an error when not authorized', () => {
                    const error = new Error( 'generated error' );
                    error.status = 401;
                    sinon.stub( server, 'checkTokenWithAuthorizationProvider' ).rejects( error );

                    const filePath = 'private/page/animal/gorilla.htm';
                    const url = '/page/animal/gorilla';

                    const fakeFile = Buffer.from( '<html>My HTML</html>' );
                    sinon.stub( fs.promises, 'readFile' );

                    // it tries public first
                    fs.promises.readFile.onCall( 0 ).rejects();
                    // then it tries private
                    fs.promises.readFile.onCall( 1 ).resolves( fakeFile );

                    // this needs to implement the interface http.IncomingMessage
                    const request = {
                        method: 'GET',
                        headers: {
                            authorization: 'Bearer bad-token'
                        },
                        url
                    };
                    // this needs to implement the interface http.ServerResponse
                    const response = new MockResponse();

                    return server.processRequest( request, response )
                        .then( () => {
                            // it tries public first
                            expect( fs.promises.readFile.firstCall.firstArg ).to.equal( path.join( SRC_DIR, filePath.replace( 'private', 'public' ) ) );
                            // then it tries private, so it can return 404 if needed
                            expect( fs.promises.readFile.lastCall.firstArg ).to.equal( path.join( SRC_DIR, filePath ) );
                            expect( response.write ).not.to.have.been.called();
                            expect( response.writeHead ).to.have.been.calledWith( 401, Server.STATUS_TEXT[ 401 ], {
                                'Access-Control-Allow-Origin': server.origin,
                                'Cache-Control': 'no-store'
                            } );
                            expect( response.end ).to.have.been.called();
                        } );
                } );
            } );

            describe( 'post', () => {
                it( 'post login', () => {
                    sinon.stub( server, 'logIn' ).resolves();

                    const request = {
                        method: 'POST',
                        url: '/login',
                        on: sinon.fake()
                    };
                    const data = JSON.stringify( {
                        username: 'my-user',
                        password: 'my-password'
                    } );
                    const response = new MockResponse();

                    const promise = server.processRequest( request, response );

                    // these calls won't exist until after processRequest is called
                    // that's why I almost never use async/await in unit tests
                    const listeners = request.on.args.reduce( ( obj, [ event, callback ] ) => {
                        obj[ event ] = callback;
                        return obj;
                    }, {} );

                    listeners.data( data );
                    listeners.end();

                    return promise
                        .then( () => {
                            expect( server.logIn ).to.have.been.calledWith( data, request, response );
                        } );
                } );

                it( '404', () => {
                    const request = {
                        method: 'POST',
                        url: '/wrong',
                        on: sinon.fake()
                    };
                    const data = JSON.stringify( {
                        username: 'my-user',
                        password: 'my-password'
                    } );
                    const response = new MockResponse();

                    const promise = server.processRequest( request, response );

                    // these calls won't exist until after processRequest is called
                    // that's why I almost never use async/await in unit tests
                    const listeners = request.on.args.reduce( ( obj, [ event, callback ] ) => {
                        obj[ event ] = callback;
                        return obj;
                    }, {} );

                    listeners.data( data );
                    listeners.end();

                    return promise
                        .then( () => {
                            expect( response.write ).not.to.have.been.called();
                            expect( response.writeHead ).to.have.been.calledWith( 404, Server.STATUS_TEXT[ 404 ], {
                                'Access-Control-Allow-Origin': server.origin,
                                'Cache-Control': 'no-store'
                            } );
                            expect( response.end ).to.have.been.called();
                        } );
                } );

                it( 'network error', () => {
                    sinon.stub( server, 'error' );

                    const request = {
                        method: 'POST',
                        url: '/wrong',
                        on: sinon.fake()
                    };
                    const response = new MockResponse();

                    const promise = server.processRequest( request, response );

                    // these calls won't exist until after processRequest is called
                    // that's why I almost never use async/await in unit tests
                    const listeners = request.on.args.reduce( ( obj, [ event, callback ] ) => {
                        obj[ event ] = callback;
                        return obj;
                    }, {} );

                    const error = new Error( 'generated error' );
                    listeners.error( error );

                    return promise
                        .then( () => {
                            expect( server.error ).to.have.been.calledWith( error );
                            expect( response.write ).not.to.have.been.called();
                            expect( response.writeHead ).to.have.been.calledWith( 400, Server.STATUS_TEXT[ 400 ], {
                                'Access-Control-Allow-Origin': server.origin,
                                'Cache-Control': 'no-store'
                            } );
                            expect( response.end ).to.have.been.called();
                        } );
                } );
            } );
        } );
    } );
} );
