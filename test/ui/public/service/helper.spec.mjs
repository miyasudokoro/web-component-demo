import helper from '/src/public/service/helper.mjs';

describe( 'service/helper', () => {
    class HelperTest extends HTMLElement {
        static get observedAttributes() {
            return [ 'chocolate', 'strawberry-banana', 'kiwi-lime' ];
        }
        get strawberryBanana() {
            return this.getAttribute( 'strawberry-banana' );
        }
        set strawberryBanana( x ) {
            this.setAttribute( 'strawberry-banana', x );
        }
        connectedCallback() {
            helper.connectedCallback( this );
        }
        disconnectedCallback() {
            helper.disconnectedCallback( this );
        }
        attributeChangedCallback( ...args ) {
            helper.attributeChangedCallback( this, ...args );
        }
        strawberryBananaAttributeChanged() {
            // note: this will throw an error if called before element is attached because no parentNode yet
            // helper.connectedCallback + helper.attributeChangedCallback delay this call until after attachment
            const callsString = this.parentNode.getAttribute( 'test-set' );
            const calls = callsString ? parseInt( callsString ) : 0;
            this.parentNode.setAttribute( 'test-set', String( calls + 1 ) );
        }
    }
    let test;
    let container;

    before( () => {
        // note that you can only define a tag once
        customElements.define( 'helper-test', HelperTest );
    } );

    beforeEach( () => {
        // note that ui.setup.mjs will delete these elements from the document body after each test
        container = document.createElement( 'section' );
        document.body.appendChild( container );

        test = new HelperTest();
        test.setAttribute( 'chocolate', 'yes' );
        test.setAttribute( 'strawberry-banana', 'no' );
        test.setAttribute( 'other-attr', 'yes' );
        container.appendChild( test );
    } );

    describe( 'custom element attach and detach', () => {
        it( 'calls attribute change handler for attribute set', () => {
            expect( container.getAttribute( 'test-set' ) ).to.equal( '1' );

            test.setAttribute( 'strawberry-banana', 'again' );

            expect( container.getAttribute( 'test-set' ) ).to.equal( '2' );
        } );

        it( 'calls attribute change handler for property set', () => {
            expect( container.getAttribute( 'test-set' ) ).to.equal( '1' );
            expect( test.strawberryBanana ).to.equal( 'no' );

            test.strawberryBanana = 'property value';

            expect( container.getAttribute( 'test-set' ) ).to.equal( '2' );
            expect( test.strawberryBanana ).to.equal( 'property value' );
        } );

        it( 'is OK with elements embedded as HTML text', () => {
            expect( container.getAttribute( 'test-set' ) ).to.equal( '1' );

            container.insertAdjacentHTML( 'beforeend', `
                <helper-test strawberry-banana="yum"></helper-test>
                <helper-test strawberry-banana="yuck"></helper-test>
            ` );

            expect( container.getAttribute( 'test-set' ) ).to.equal( '3' );
        } );

        it( 'can handle multiple elements at the same time', () => {
            expect( container.getAttribute( 'test-set' ) ).to.equal( '1' );

            const two = new HelperTest();
            two.strawberryBanana = 'yum';

            const three = new HelperTest();
            three.strawberryBanana = 'yuck';

            container.append( two, three );

            expect( container.getAttribute( 'test-set' ) ).to.equal( '3' );

            expect( test.strawberryBanana ).to.equal( 'no' );
            expect( two.strawberryBanana ).to.equal( 'yum' );
            expect( three.strawberryBanana ).to.equal( 'yuck' );
        } );

        it( 'does not call change handler for a non-change', () => {
            expect( container.getAttribute( 'test-set' ) ).to.equal( '1' );

            test.setAttribute( 'strawberry-banana', 'no' );

            expect( container.getAttribute( 'test-set' ) ).to.equal( '1' );
        } );

        it( 'clears event listeners when removed from DOM', () => {
            const fake = sinon.fake();
            helper.safeEventListener( test, 'click', fake );
            expect( fake.callCount ).to.equal( 0 );
            test.dispatchEvent( new MouseEvent( 'click' ) );
            expect( fake.callCount ).to.equal( 1 );

            test.remove();

            test.dispatchEvent( new MouseEvent( 'click' ) );
            expect( fake.callCount ).to.equal( 1 );
        } );

        it( 'clears event listeners of child elements when removed from DOM', () => {
            const button = document.createElement( 'button' );
            test.appendChild( button );

            const fake = sinon.fake();
            helper.safeEventListener( button, 'click', fake );
            expect( fake.callCount ).to.equal( 0 );
            button.dispatchEvent( new MouseEvent( 'click' ) );
            expect( fake.callCount ).to.equal( 1 );

            test.remove();

            button.dispatchEvent( new MouseEvent( 'click' ) );
            expect( fake.callCount ).to.equal( 1 );
        } );

        it( 'clears event listeners of shadow root elements when removed from DOM', () => {
            const button = document.createElement( 'button' );
            test.attachShadow( {
                mode: 'open'
            } );
            test.shadowRoot.appendChild( button );

            const fake = sinon.fake();
            helper.safeEventListener( button, 'click', fake );
            expect( fake.callCount ).to.equal( 0 );
            button.dispatchEvent( new MouseEvent( 'click' ) );
            expect( fake.callCount ).to.equal( 1 );

            test.remove();

            button.dispatchEvent( new MouseEvent( 'click' ) );
            expect( fake.callCount ).to.equal( 1 );
        } );

        it( 'calls custom removal callback when removed from DOM', () => {
            const fake = sinon.fake();

            helper.addRemoveListener( test, fake );

            test.remove();

            expect( fake.callCount ).to.equal( 1 );
        } );

        it( 'clears correct listeners if multiple elements registered at the same time', () => {
            // setup
            const span = document.createElement( 'span' );
            document.body.append( span );
            const spanFake = sinon.fake();
            helper.safeEventListener( span, 'click', spanFake );

            const testFakeClick = sinon.fake();
            const testFakeKeyup = sinon.fake();
            helper.safeEventListener( test, 'click', testFakeClick );
            helper.safeEventListener( test, 'keyup', testFakeKeyup );

            // confirm expected starting state: the three listeners work
            test.dispatchEvent( new MouseEvent( 'click' ) );
            expect( testFakeClick.callCount ).to.equal( 1 );
            expect( testFakeKeyup.callCount ).to.equal( 0 );
            expect( spanFake.callCount ).to.equal( 0 );

            test.dispatchEvent( new KeyboardEvent( 'keyup' ) );
            expect( testFakeClick.callCount ).to.equal( 1 );
            expect( testFakeKeyup.callCount ).to.equal( 1 );
            expect( spanFake.callCount ).to.equal( 0 );

            span.dispatchEvent( new MouseEvent( 'click' ) );
            expect( testFakeClick.callCount ).to.equal( 1 );
            expect( testFakeKeyup.callCount ).to.equal( 1 );
            expect( spanFake.callCount ).to.equal( 1 );

            // call the method that is under test (helper.disconnectedCallback gets called automatically)
            test.remove();

            // confirm that the listeners on element `test` were removed
            test.dispatchEvent( new MouseEvent( 'click' ) );
            test.dispatchEvent( new KeyboardEvent( 'keyup' ) );
            expect( testFakeClick.callCount ).to.equal( 1 );
            expect( testFakeKeyup.callCount ).to.equal( 1 );
            expect( spanFake.callCount ).to.equal( 1 );

            // confirm that unrelated listeners were not removed
            span.dispatchEvent( new MouseEvent( 'click' ) );
            expect( testFakeClick.callCount ).to.equal( 1 );
            expect( spanFake.callCount ).to.equal( 2 );
        } );
    } );

    describe( 'copy attributes from one element to another', () => {
        it( 'copies the observed attributes by default', () => {
            const div = document.createElement( 'div' );

            helper.copyAttributes( test, div );

            expect( div.getAttribute( 'chocolate' ) ).to.equal( 'yes' );
            expect( div.getAttribute( 'strawberry-banana' ) ).to.equal( 'no' );
            expect( div.hasAttribute( 'kiwi-lime' ) ).to.be.false();
            expect( div.hasAttribute( 'other-attr' ) ).to.be.false();
        } );

        it( 'copies specified attributes/properties regardless of case', () => {
            const div = document.createElement( 'div' );

            helper.copyAttributes( test, div, [ 'Chocolate', 'KIWI_LIME', 'otherAttr' ] );

            expect( div.getAttribute( 'chocolate' ) ).to.equal( 'yes' );
            expect( div.hasAttribute( 'strawberry-banana' ) ).to.be.false();
            expect( div.hasAttribute( 'kiwi-lime' ) ).to.be.false();
            expect( div.getAttribute( 'other-attr' ) ).to.equal( 'yes' );
        } );

        it( 'does not throw if no attributes to copy are provided', () => {
            const one = document.createElement( 'div' );
            const two = document.createElement( 'div' );

            expect( () => helper.copyAttributes( one, two ) ).not.to.throw();
        } );
    } );
} );
