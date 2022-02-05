import DemoError from '/src/public/component/demo-error.mjs';

describe( 'component/demo-error', () => {
    let error;

    beforeEach( () => {
        error = new DemoError();
        // note: ui.setup.mjs will remove this appended element after each test
        document.body.append( error );
    } );

    it( 'message displays and announces on screen reader', () => {
        const live = error.shadowRoot.querySelector( '[aria-live]' );
        expect( live.textContent ).to.equal( '' );

        // this is one way to check whether something is displayed
        let display = getComputedStyle( live ).getPropertyValue( 'display' );
        expect( display ).to.equal( 'none' );

        error.message = 'test message';

        expect( live.textContent ).to.equal( 'test message' );
        expect( error.message ).to.equal( 'test message' );
        display = getComputedStyle( live ).getPropertyValue( 'display' );
        expect( display ).to.equal( 'block' );
    } );
} );
