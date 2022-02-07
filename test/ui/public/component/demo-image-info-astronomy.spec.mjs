import { DemoImageInfoAstronomy, ENDPOINT } from '/src/public/component/demo-image-info-astronomy.mjs';
import { awaitAttributeChange } from '/test/ui.util.mjs';

describe( 'component/demo-image-info-astronomy', () => {
    let element;
    let mockAPI;
    const today = '2022-02-06'; // set a specific date so we know what date "today" is

    beforeEach( () => {
        sinon.useFakeTimers( new Date( today ) );
        mockAPI = {
            [ today ]: {
                date: today,
                copyright: 'Juan Pérez'
            },
            '2020-10-10': {
                date: '2020-10-10',
                copyright: 'Jane Doe'
            },
            '2021-11-11': {
                date: '2021-11-11',
                copyright: 'Yamada Tarou'
            }
        };
        sinon.stub( window, 'fetch' ).callsFake( href => {
            return new Promise( resolve => {
                const url = new URL( href );
                const date = url.searchParams.get( 'date' );
                const result = mockAPI[ date ];
                const status = result ? { status: 200, statusText: 'ok', ok: true } : { status: 404, statusText: 'Not Found', ok: false };

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

        const inputStyle = getComputedStyle( input );
        expect( inputStyle.getPropertyValue( 'display' ) ).to.equal( 'none' );
        expect( inputStyle.getPropertyValue( 'visibility' ) ).to.equal( 'hidden' );

        // by returning this promise, we indicate this is an asynchronous test
        return awaitAttributeChange( element, 'date' )
            .then( () => {
                expect( element.date ).to.equal( mockAPI[ today ].date );
                expect( input.value ).to.equal( mockAPI[ today ].date );
                const inputStyle = getComputedStyle( input );
                expect( inputStyle.getPropertyValue( 'display' ) ).to.equal( 'flex' );
                expect( inputStyle.getPropertyValue( 'visibility' ) ).to.equal( 'visible' );
            } );
    } );

    describe( 'after the initial load', () => {
        beforeEach( () => {
            // by returning this promise, we make the tests below wait for it to complete
            return awaitAttributeChange( element, 'copyright' )
                .then( value => {
                    expect( value ).to.equal( mockAPI[ today ].copyright );
                } );
        } );

        it( 'sets a new endpoint via the date attribute', () => {
            const input = element.shadowRoot.querySelector( 'input[type=date]' );
            element.date = '2020/10/10';
            expect( input.value ).to.equal( '2020-10-10' );
            expect( element.endpoint ).to.equal( ENDPOINT );
            expect( window.fetch ).to.have.been.called();

            // it won't change until the fetch finishes
            expect( element.copyright ).to.equal( mockAPI[ today ].copyright );
            return awaitAttributeChange( element, 'copyright' )
                .then( value => {
                    expect( value ).to.equal( mockAPI[ '2020-10-10' ].copyright );
                } );
        } );

        it( 'sets a new endpoint via the input', () => {
            const input = element.shadowRoot.querySelector( 'input[type=date]' );

            // this simulates a user putting the value into the input
            input.value = '2021-11-11';
            input.dispatchEvent( new InputEvent( 'input' ) );

            expect( element.endpoint ).to.equal( ENDPOINT );
            expect( window.fetch ).to.have.been.called();

            expect( element.copyright ).to.equal( mockAPI[ today ].copyright );
            return awaitAttributeChange( element, 'copyright' )
                .then( value => {
                    expect( value ).to.equal( mockAPI[ '2021-11-11' ].copyright );
                } );
        } );
    } );
} );
