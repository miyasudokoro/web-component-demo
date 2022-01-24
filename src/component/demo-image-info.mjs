import DemoFigure from './demo-figure.mjs';
import DemoError from './demo-error.mjs';
import helper from '../service/helper.mjs';


const TEMPLATE = `
<style>
:host {
    --demo-error-text-color: orange;
}
img:not([src]), video:not([src]), label:empty, cite:empty, time:empty, blockquote:empty, aside:empty {
    display: none;
    visibility: hidden;
}

</style>

<section><i></i></section>
`;

class DemoImageInfo extends HTMLElement {
    constructor() {
        super();
        // here is the shadow root
        this.attachShadow( {
            mode: 'open'
            // note: some components need delegatesFocus: true
        } );
    }

    static get tag() {
        return 'demo-image-info';
    }

    static get observedAttributes() {
        return [ 'endpoint', 'base' ];
    }

    get endpoint() {
        return this.getAttribute( 'endpoint' );
    }
    set endpoint( endpoint ) {
        this.setAttribute( 'endpoint', endpoint );
    }

    get base() {
        return this.getAttribute( 'base' );
    }
    set base( base ) {
        this.setAttribute( 'base', base );
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = TEMPLATE;
        this.section = this.shadowRoot.querySelector( 'section' );
        helper.connectedCallback( this );
    }

    disconnectedCallback() {
        this.section = undefined;
        helper.disconnectedCallback( this );
    }

    attributeChangedCallback( name, previous, current ) {
        helper.attributeChangedCallback( this, name, previous, current );
    }

    endpointAttributeChanged( endpoint ) {
        if ( !endpoint ) {
            this.displayError( 'Endpoint not configured' );
        } else {
            return fetch( endpoint )
                .then( response => response.ok ? response.json() : Promise.reject( new Error( response.status ) ) )
                .then( json => this.displayContent( json ) )
                .catch( e => this.displayError( e.message ) );
        }
    }

    displayContent( data ) {
        // example: a child custom element
        const figure = new DemoFigure();
        // replaceChild lets us wipe out any existing nodes
        this.section.replaceChild( figure, this.section.firstChild );
        // we can call a custom method
        figure.displayData( data, this.base );
    }

    displayError( text ) {
        const error = new DemoError();
        // replaceChild lets us wipe out any existing nodes
        this.section.replaceChild( error, this.section.firstChild );
        // we can set a custom property
        error.message = text;
    }
}


export default DemoImageInfo;

customElements.define( DemoImageInfo.tag, DemoImageInfo );

