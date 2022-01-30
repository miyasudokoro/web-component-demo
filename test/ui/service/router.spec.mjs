// note: I can import from /src/.. because that proxy is configured
import router from '/src/public/service/router.mjs';
import { CUSTOM_EVENT, DEFAULT_VIEW } from '/src/public/service/constants.mjs';

describe( 'service/router', () => {
    let docListener;
    let locationMock;

    afterEach( () => {
        router.reset();
        docListener && document.removeEventListener( CUSTOM_EVENT.VIEW_CHANGE, docListener );
    } );

    it( 'sends event on initial load without hash', () => {
        docListener = sinon.fake();
        document.addEventListener( CUSTOM_EVENT.VIEW_CHANGE, docListener );

        locationMock = new URL( 'https://domain.com' );
        router.initialize( locationMock );

        expect( docListener.callCount ).to.equal( 1 );
        const e = docListener.lastArg;
        expect( e.detail.viewInfo ).to.deep.equal( [ DEFAULT_VIEW ] );
    } );

    it( 'sends event on initial load with hash', () => {
        docListener = sinon.fake();
        document.addEventListener( CUSTOM_EVENT.VIEW_CHANGE, docListener );

        locationMock = new URL( 'https://domain.com#animal/dogs' );
        router.initialize( locationMock );

        expect( docListener.callCount ).to.equal( 1 );
        const e = docListener.lastArg;
        expect( e.detail.viewInfo ).to.deep.equal( [ 'animal', 'dogs' ] );
    } );

    describe( 'after loading', () => {
        beforeEach( () => {
            // Note: the URL type is pretty close to the Location type, so it makes a good mock
            locationMock = new URL( 'https://domain.com#animal/dogs' );
            router.initialize( locationMock );

            docListener = sinon.fake();
            document.addEventListener( CUSTOM_EVENT.VIEW_CHANGE, docListener );
        } );

        it( 'sends event on back/forward button', () => {
            const event = new PopStateEvent( 'popstate' );
            locationMock.hash = '#animal/cats';
            window.dispatchEvent( event );

            expect( docListener.callCount ).to.equal( 1 );
            const e = docListener.lastArg;
            expect( e.detail.viewInfo ).to.deep.equal( [ 'animal', 'cats' ] );
        } );

        it( 'sends event on hash change event', () => {
            const event = new HashChangeEvent( 'hashchange' );
            locationMock.hash = '#animal/cats';
            window.dispatchEvent( event );

            expect( docListener.callCount ).to.equal( 1 );
            const e = docListener.lastArg;
            expect( e.detail.viewInfo ).to.deep.equal( [ 'animal', 'cats' ] );
        } );
    } );
} );

