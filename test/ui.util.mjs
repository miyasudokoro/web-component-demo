
let karmaLoad;

window.fail = window.chai.expect.fail;
window.originalSetTimeout = window.setTimeout;

/**
 * @exports karmaDebug
 * @description Karma configuration debugging tools
 */
export const karmaDebug = {
    /** Lists files that Karma loaded. Use this if you are having trouble configuring Karma files or proxies. */
    listFiles() {
        console.log( 'karmaDebug:listFiles' );
        for ( const file in window.__karma__.files ) {
            console.log( file );
        }
    }
};

before( function() {
    // record the initial state of the document body
    karmaLoad = new Set( document.body.children );
    // tests do not run reliably if the browser is throttling the tab/window because it's inactive
    if ( document.visibilityState === 'hidden' ) {
        fail( 'Aborted: Document visibility state is hidden. Make Karma window active before running tests.' );
    }
} );

// after each test ...
afterEach( function() {
    // restore the sinon contexts to their initial state
    sinon.restore();
    // restore the document body to its initial state
    const children = document.body.children;
    for ( let i = children.length; i--; ) {
        if ( !karmaLoad.has( children[ i ] ) ) {
            document.body.removeChild( children[ i ] );
        }
    }
} );

// canary unit test: proves your test setup works
describe( 'canary', () => {
    it( 'adds 2 + 2', () => {
        expect( 2 + 2 ).to.equal( 4 );
    } );

    it( 'expects promises', () => {
        const promise = new Promise( ( resolve, _reject ) => {
            setTimeout( () => resolve( 'abc' ) );
        } );
        return promise
            .then( result => {
                expect( result ).to.equal( 'abc' );
            } );
    } );

    const stubby = {
        method: () => {
            return true;
        }
    };

    describe( 'sinon', () => {
        it( 'stubs', () => {
            sinon.stub( stubby, 'method' ).callsFake( () => {
                return false;
            } );
            expect( stubby.method() ).to.equal( false );
            expect( stubby.method ).to.have.been.called();
        } );
    } );

    describe( 'correct setup', () => {
        it( 'resets stubs automatically', () => {
            expect( stubby.method() ).to.equal( true );
        } );

        it( 'puts element in body', () => {
            const fix = document.createElement( 'span' );
            fix.id = 'myfix';

            try {
                document.body.appendChild( fix );

                const found = document.getElementById( 'myfix' );
                expect( found ).to.equal( fix );
            } catch ( e ) {
                fail( e );
            }
        } );

        it( 'removes element from body automatically', () => {
            expect( document.getElementById( 'myfix' ) ).to.be.null();
        } );
    } );
} );
