import DemoMain from '/src/public/component/demo-main.mjs';
import DemoError from '/src/public/component/demo-error.mjs';
import { PAGE } from '/src/public/service/constants.mjs';
import auth from '/src/public/service/auth.mjs';

const LOGGED_IN = 'logged-in-token';

const privatePages = {
    [ `/${PAGE}/dogs` ]: `
    <h1>A dog page</h1>
    `
};

const publicPages = {
    [ `/${PAGE}/cats` ]: `
    <h1>A cat page</h1>
    `
};


describe( 'component/demo-main', () => {
    let demo;
    describe( 'fetches pages', () => {
        beforeEach( () => {
            sinon.stub( window, 'fetch' ).callsFake( request => {
                return new Promise( resolve => {
                    const url = new URL( request.url );
                    if ( privatePages[ url.pathname ] ) {
                        const auth = request.headers.get( 'authorization' );
                        if ( auth ) {
                            const token = auth.replace( 'Bearer ', '' );
                            if ( token === LOGGED_IN ) {
                                // note: you have to use response.clone() so the response body will not count as "already used"
                                return resolve( new Response( privatePages[ url.pathname ], { status: 200 } ).clone() );
                            }
                        }
                        return resolve( new Response( '', { status: 403, statusText: 'Unauthorized' } ).clone() );
                    } else if ( publicPages[ url.pathname ] ) {
                        return resolve( new Response( publicPages[ url.pathname ], { status: 200 } ).clone() );
                    } else {
                        return resolve( new Response( '', { status: 404, statusText: 'Not Found' } ).clone() );
                    }
                } );
            } );
            demo = new DemoMain();
            sinon.spy( demo, 'displayError' );
            sinon.spy( demo, 'loadPage' );
            document.body.appendChild( demo );
        } );

        afterEach( () => {
            auth.reset();
        } );

        it( 'fetches public page', () => {
            expect( demo.main.querySelector( 'h1' ) ).to.equal( null );
            return demo.fetchPage( 'cats' )
                .then( () => {
                    expect( demo.displayError ).not.to.have.been.called();
                    expect( demo.main.querySelector( 'h1' ).textContent ).to.equal( 'A cat page' );
                } );
        } );

        it( 'fetches private page if user is logged in', () => {
            sinon.stub( auth, 'getHeaders' ).returns( new Headers( {
                Authorization: `Bearer ${LOGGED_IN}`
            } ) );
            return demo.fetchPage( 'dogs' )
                .then( () => {
                    expect( demo.displayError ).not.to.have.been.called();
                    expect( demo.main.querySelector( 'h1' ).textContent ).to.equal( 'A dog page' );
                } );
        } );

        it( 'has 403 if user is not logged in', () => {
            sinon.stub( auth, 'getHeaders' ).returns( new Headers() );
            return demo.fetchPage( 'dogs' )
                .then( () => {
                    expect( demo.displayError ).to.have.been.called();
                    const el = demo.shadowRoot.querySelector( DemoError.tag );
                    expect( el.messageKey ).to.equal( 'error.403' );
                } );
        } );
    } );
} );
