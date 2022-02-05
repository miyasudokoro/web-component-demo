
import helper from '../service/helper.mjs';

const TEMPLATE = `
<style>

[aria-live] {
    display: block;
    color: var(--demo-error-text-color, red);
    padding: 40px;
    border: 1px solid var(--demo-error-text-color, red);
}
[aria-live]:empty {
    display: none;
}

</style>
<aside aria-live></aside>
`;

/** @class DemoError
 * @extends HTMLElement
 * @description Displays error information
 */
class DemoError extends HTMLElement {
    /** Constructor */
    constructor() {
        super();
        // here is the shadow root
        this.attachShadow( {
            mode: 'open'
            // note: some components need delegatesFocus: true
        } );
    }

    /** @type string */
    static get tag() {
        return 'demo-error';
    }

    /** @type Array<string> */
    static get observedAttributes() {
        return [ 'message' ];
    }

    /** @type string */
    get message() {
        return this.getAttribute( 'message' );
    }
    // note: using @alias allows linter enforcement of JSDoc but prevents double listing of the property
    /** @alias DemoError.prototype~message */
    set message( message ) {
        this.setAttribute( 'message', message );
    }

    /** @override */
    connectedCallback() {
        this.shadowRoot.innerHTML = TEMPLATE;

        // "aria-live" means the screen reader will announce the message when the text content changes
        this.live = this.shadowRoot.querySelector( '[aria-live]' );

        helper.connectedCallback( this );
    }

    /** @override */
    disconnectedCallback() {
        helper.disconnectedCallback( this );
    }

    /** @override */
    attributeChangedCallback( name, previous, current ) {
        helper.attributeChangedCallback( this, name, previous, current );
    }

    /** Handles the message attribute changing.
     *
     * @param message
     */
    messageAttributeChanged( message ) {
        this.live.textContent = message;
    }
}

export default DemoError;

customElements.define( DemoError.tag, DemoError );
