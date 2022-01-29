
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

class DemoError extends HTMLElement {
    constructor() {
        super();
        // here is the shadow root
        this.attachShadow( {
            mode: 'open'
            // note: some components need delegatesFocus: true
        } );
    }

    static get tag() {
        return 'demo-error';
    }

    static get observedAttributes() {
        return [ 'message' ];
    }

    get message() {
        return this.getAttribute( 'message' );
    }
    set message( message ) {
        this.setAttribute( 'message', message );
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = TEMPLATE;
        this.live = this.shadowRoot.querySelector( '[aria-live]' );
        helper.connectedCallback( this );
    }

    disconnectedCallback() {
        helper.disconnectedCallback( this );
    }

    attributeChangedCallback( name, previous, current ) {
        helper.attributeChangedCallback( this, name, previous, current );
    }

    messageAttributeChanged( message ) {
        this.live.textContent = message;
    }
}

export default DemoError;

customElements.define( DemoError.tag, DemoError );
