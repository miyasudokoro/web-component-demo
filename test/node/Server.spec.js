// get the shared globals; we would include this at the top of every spec file
require( '../node.util.js' );

// get dependencies we will need for the test cases
const rewire = require( 'rewire' );

// note the use of the "rewire" tool on our test file so we can apply global mocks
const Server = rewire( '../../src/Server.js' );

describe( 'Server.js', () => {
    let httpsMock,
        processMock,
        consoleMock,
        fsMock,
        httpsServerMock,
        logStreamMock;

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
        fsMock = {
            createWriteStream: sinon.fake.returns( logStreamMock ),
            readFileSync: sinon.stub()
        };
        // stubs are useful because you can return specific things
        fsMock.readFileSync.onCall( 0 ).returns( 'file 1' );
        fsMock.readFileSync.onCall( 1 ).returns( 'file 2' );

        // insert mocks using the "rewire" tool
        Server.__set__( 'https', httpsMock );
        Server.__set__( 'process', processMock );
        Server.__set__( 'console', consoleMock );
        Server.__set__( 'fs', fsMock );
    } );

    afterEach( () => {
        // clear all cached information to return the file to a pristine state
        Server.reset();
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
            // we can stub the initialization function to prevent actual server and log streams
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

    describe( 'server', () => {
        let server;

        beforeEach( () => {
            server = new Server( 'my.domain.com', '4444' );
        } );

        describe( 'process listeners', () => {
            let eventListeners;

            beforeEach( () => {
                // here is how you can extract anonymous callback functions to test them
                // first, get the Sinon fake calls that would have registered the listeners for "process.on"
                const calls = processMock.on.args;
                // second, get the callbacks out ... here, I am making an object { event: callback }
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
        } );
    } );
} );
