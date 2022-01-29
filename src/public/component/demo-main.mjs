
import { CUSTOM_EVENT, SERVER_LOCATION } from '../service/constants.mjs';
import helper from '../service/helper.mjs';
import DemoError from '../component/demo-error.mjs';

const TEMPLATE = `
<nav>
    <ul>
        <li>Animals
            <ul>
                <li><a href="#animal/cats">Cats</a></li>
                <li><a href="#animal/dogs">Dogs</a></li>
            </ul>
        </li>
        <li>Nature
            <ul>
                <li><a href="#natural/astronomy">Astronomy</a></li>
                <li><a href="#natural/oops">Dividing by Zero</a></li>
            </ul>
        </li>
    </ul>
</nav>
<main></main>
`;

class DemoMain extends HTMLElement {
    // note: no shadow DOM

    static get tag() {
        return 'demo-main';
    }

    static get observedAttributes() {
        return [ 'view' ];
    }

    get view() {
        return this.getAttribute( 'view' );
    }
    set view( view ) {
        this.setAttribute( 'view', view );
    }

    connectedCallback() {
        this.innerHTML = TEMPLATE;
        this.main = this.querySelector( 'main' );
        // make sure the event listener will be removed later to avoid zombie behavior and memory leaks
        helper.safeEventListener( this, document, CUSTOM_EVENT.VIEW_CHANGE, e => {
            const { viewInfo } = e.detail;
            this.view = viewInfo.join( '/' );
        } );
        // now that the element has connected, changed attributes can process
        helper.connectedCallback( this );
    }

    disconnectedCallback() {
        // the helper will remove event listeners
        helper.disconnectedCallback( this );
    }

    attributeChangedCallback( name, previous, current) {
        // this helper function waits to handle attributes until after the element is connected
        helper.attributeChangedCallback( this, name, previous, current );
    }

    /** Handles what happens when the view changes. Note that this will not fire unless an actual change has occurred.
     *
     * @param view
     * @returns {Promise<never>}
     */
    viewAttributeChanged( view ) {
        // example: fetching HTML from a server that might respond 404, 403, 401, etc.
        const path = [ SERVER_LOCATION, view ].join( '/' );
        return fetch( path, {
            // headers: { Authorization: 'Bearer my-fake-token' }
        } )
            .then( response => response.ok ? response.text() : Promise.reject( new Error( response.status + ' ' + response.statusText ) ) )
            .then( html => {
                while ( this.main.firstChild ) {
                    this.main.firstChild.remove();
                }
                const parser = new DOMParser();
                const doc = parser.parseFromString( html, 'text/html' );
                const node = document.adoptNode( doc.body );
                const children = Array.from( node.childNodes )
                    .map( node => {
                        // DOMParser script nodes do not work, which is good for your security
                        // only create a new script node like this if you are sure it's safe
                        if ( node instanceof HTMLScriptElement ) {
                            const s = document.createElement( 'script' );
                            const attributes = [ ...node.attributes ];
                            attributes.forEach( at => s.setAttribute( at.name, at.value ) );
                            s.textContent = node.textContent;
                            return s;
                        }
                        return node;
                    } );
                this.main.append( ...children );
            } )
            .catch( e => this.displayError( e ) );
    }

    displayError( e ) {
        while ( this.main.firstChild ) {
            this.main.firstChild.remove();
        }
        const error = new DemoError();
        error.message = e.message;
        this.main.append( error );
    }
}

export default DemoMain;

customElements.define( DemoMain.tag, DemoMain );
