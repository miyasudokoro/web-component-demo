import DemoError from '/src/public/component/demo-error.mjs';
import translator from '/src/public/service/translator.mjs';
import { awaitTextChange } from '/test/ui.util.mjs';

describe( 'component/demo-error', () => {
    let error;

    beforeEach( () => {
        // fixture: we put a fresh web component into the DOM before each test
        // note: ui.setup.mjs will remove this appended element after each test
        error = new DemoError();
        document.body.append( error );
        // wait for the translator to be ready
        return translator.initialize();
    } );

    afterEach( () => {
        // clean up the state of the translator
        translator.reset();
    } );

    it( 'message displays and announces on screen reader', () => {
        // 1. ready the initial state/fixture
        const live = error.shadowRoot.querySelector( '[aria-live]' );

        // 2. assert the initial value of any changeable states
        expect( error.messageKey ).to.equal( null );
        expect( live.textContent ).to.equal( '' );
        let display = getComputedStyle( live ).getPropertyValue( 'display' );
        expect( display ).to.equal( 'none' );

        // 3. call the function
        // -- in this case, change listener functions will be called when the attribute changes
        error.messageKey = 'error.401';

        // because the translator works via an observer, we wait for at least one event cycle
        return awaitTextChange( live ).then( () => {
            // 5. assert any states that could have changed
            expect( live.textContent ).to.equal( 'You are not signed in' );
            expect( error.messageKey ).to.equal( 'error.401' );
            expect( error.getAttribute( 'message-key' ) ).to.equal( 'error.401' );
            display = getComputedStyle( live ).getPropertyValue( 'display' );
            expect( display ).to.equal( 'block' );
        } );
    } );
} );
