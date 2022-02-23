
import helper from '../service/helper.mjs';

const TEMPLATE = `
<style>

[aria-live] {
    display: block;
    color: var(--demo-error-text-color, firebrick);
    padding: 40px;
    border: 1px solid var(--demo-error-text-color, firebrick);
}
[aria-live]:empty {
    display: none;
}

</style>
<aside aria-live="assertive" role="alert"></aside>
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
        return [ 'message-key' ];
    }

    /** @type string */
    get messageKey() {
        return this.getAttribute( 'message-key' );
    }
    // note: using @alias allows linter enforcement of JSDoc but prevents double listing of the property
    /** @alias DemoError.prototype~messageKey */
    set messageKey( messageKey ) {
        this.setAttribute( 'message-key', messageKey );
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

    /** Handles the message key attribute changing by passing it down to the aria-live where it will be displayed.
     *
     * @param messageKey {string} the message key
     */
    messageKeyAttributeChanged( messageKey ) {
        this.live.setAttribute( 'i18n', messageKey );
    }
}

export default DemoError;

customElements.define( DemoError.tag, DemoError );
