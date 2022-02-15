import DemoError from '/src/public/component/demo-error.mjs';

describe( 'component/demo-error', () => {
    let error;

    beforeEach( () => {
        // fixture: we put a fresh web component into the DOM before each test
        // note: ui.setup.mjs will remove this appended element after each test
        error = new DemoError();
        document.body.append( error );
    } );

    it( 'message displays and announces on screen reader', () => {
        // 1. ready the initial state/fixture
        const live = error.shadowRoot.querySelector( '[aria-live]' );

        // 2. assert the initial value of any changeable states
        expect( error.message ).to.equal( null );
        expect( live.textContent ).to.equal( '' );
        let display = getComputedStyle( live ).getPropertyValue( 'display' );
        expect( display ).to.equal( 'none' );

        // 3. call the function
        // -- in this case, change listener functions will be called when the attribute changes
        error.message = 'test message';

        // 5. assert any states that could have changed
        expect( live.textContent ).to.equal( 'test message' );
        expect( error.message ).to.equal( 'test message' );
        expect( error.getAttribute( 'message' ) ).to.equal( 'test message' );
        display = getComputedStyle( live ).getPropertyValue( 'display' );
        expect( display ).to.equal( 'block' );
    } );
} );
