import { DemoImageInfoAstronomy, ENDPOINT } from '/src/public/component/demo-image-info-astronomy.mjs';
import { awaitAttributeChange } from '/test/ui.util.mjs';

describe( 'component/demo-image-info-astronomy', () => {
    let element;
    const mockAPI = {
        'today': {
            copyright: 'Juan Pérez'
        },
        '2020-10-10': {
            copyright: 'Jane Doe'
        },
        '2021-11-11': {
            copyright: 'Yamada Tarou'
        }
    };

    beforeEach( () => {
        sinon.stub( window, 'fetch' ).callsFake( href => {
            return new Promise( resolve => {
                const url = new URL( href );
                const date = url.searchParams.get( 'date' ) || 'today';
                const result = mockAPI[ date ];
                const status = result ? { status: 200, statusText: 'ok' } : { status: 404, statusText: 'Not Found' };

                // note: you have to use response.clone() so the response body will not count as "already used"
                const response = new Response( JSON.stringify( result ), status ).clone();
                resolve( response );
            } );
        } );
        element = new DemoImageInfoAstronomy();
        document.body.append( element );
    } );

    it( 'initializes correctly', () => {
        expect( element.endpoint ).to.equal( ENDPOINT );
        const input = element.shadowRoot.querySelector( 'input[type=date]' );
        expect( input ).to.exist();

        // by returning this promise, we indicate this is an asynchronous test
        return awaitAttributeChange( element, 'copyright' )
            .then( value => {
                expect( value ).to.equal( 'Juan Pérez' );
            } );
    } );

    describe( 'after the initial load', () => {
        beforeEach( () => {
            // by returning this promise, we make the tests below wait for it to complete
            return awaitAttributeChange( element, 'copyright' )
                .then( value => {
                    expect( value ).to.equal( 'Juan Pérez' );
                } );
        } );

        it( 'sets a new endpoint via the date attribute', () => {
            const input = element.shadowRoot.querySelector( 'input[type=date]' );
            element.date = '2020/10/10';
            expect( input.value ).to.equal( '2020-10-10' );
            expect( element.endpoint ).to.equal( ENDPOINT + '&date=2020-10-10' );
            expect( window.fetch ).to.have.been.called();

            return awaitAttributeChange( element, 'copyright' )
                .then( value => {
                    expect( value ).to.equal( 'Jane Doe' );
                } );
        } );

        it( 'sets a new endpoint via the input', () => {
            const input = element.shadowRoot.querySelector( 'input[type=date]' );

            // this simulates a user putting the value into the input
            input.value = '2021-11-11';
            input.dispatchEvent( new InputEvent( 'input' ) );

            expect( element.endpoint ).to.equal( ENDPOINT + '&date=2021-11-11' );
            expect( window.fetch ).to.have.been.called();

            return awaitAttributeChange( element, 'copyright' )
                .then( value => {
                    expect( value ).to.equal( 'Yamada Tarou' );
                } );
        } );
    } );
} );
