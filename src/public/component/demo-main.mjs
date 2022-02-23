
import { CUSTOM_EVENT, SERVER_LOCATION, PAGE } from '../service/constants.mjs';
import helper from '../service/helper.mjs';
import auth from '../service/auth.mjs';
import DemoError from '../component/demo-error.mjs';
import DemoSignIn from '../component/demo-sign-in.mjs';

const TEMPLATE = `
<style>
body {
    font-family: Verdana, sans-serif;
}
body[lang=ja-jp] {
    font-family: Meiryo, monospace;
}
</style>
<a href="#index" i18n="home"></a>
<nav>
    <ul>
        <li><span i18n="animals"></span>
            <ul>
                <li><a href="#animal/cats" i18n="cat.pictures"></a></li>
                <li><a href="#animal/dogs" i18n="dog.pictures"></a></li>
            </ul>
        </li>
        <li><span i18n="nature"></span>
            <ul>
                <li><a href="#natural/astronomy" i18n="astronomy.pictures"></a></li>
                <li><a href="#natural/oops" i18n="zero.pictures"></a></li>
            </ul>
        </li>
    </ul>
</nav>
<main></main>
`;

/** @class DemoMain
 * @extends HTMLElement
 * @description Runs the demo. Contains the navigation and main display area.
 */
class DemoMain extends HTMLElement {
    // note: this is an example of a custom element with no shadow DOM

    /** @type {string} */
    static get tag() {
        return 'demo-main';
    }

    /** @type {Array<string>} */
    static get observedAttributes() {
        return [ 'view' ];
    }

    /** The current page shown in the main view.
     *
     * @returns {string}
     */
    get view() {
        return this.getAttribute( 'view' );
    }
    /** @alias DemoMain.prototype~view */
    set view( view ) {
        this.setAttribute( 'view', view );
    }

    /** @override */
    connectedCallback() {
        this.innerHTML = TEMPLATE;
        this.main = this.querySelector( 'main' );

        const remover = helper.safeEventListener( document, CUSTOM_EVENT.VIEW_CHANGE, e => {
            const { viewInfo } = e.detail;
            this.view = viewInfo.join( '/' );
        } );
        // make sure the event listener will be removed later to avoid zombie behavior and memory leaks
        // note that this is needed because it's a listener on something outside itself
        helper.addRemoveListener( this, remover );

        // this listener picks up events coming from child elements
        this.addEventListener( CUSTOM_EVENT.VIEW_REFRESH, () => this.fetchPage( this.view ) );

        // now that the element has connected, changed attributes can process
        helper.connectedCallback( this );
    }

    /** @override */
    disconnectedCallback() {
        // the helper will remove event listeners
        helper.disconnectedCallback( this );
    }

    /** @override */
    attributeChangedCallback( name, previous, current) {
        // this helper function waits to handle attributes until after the element is connected
        helper.attributeChangedCallback( this, name, previous, current );
    }

    /** Handles what happens when the view changes. Note that this will not fire unless an actual change has occurred.
     *
     * @param view {string} the view that changed
     */
    viewAttributeChanged( view ) {
        this.fetchPage( view );
    }

    /** Fetches the page for this view.
     *
     * @param view {string} the view page to fetch
     * @returns {Promise<void>}
     */
    fetchPage( view ) {
        const request = new Request( [ SERVER_LOCATION, PAGE, view ].join( '/' ), {
            headers: auth.getHeaders()
        } );

        return fetch( request )
            // example: fetching HTML from a server that might respond 404, 403, 401, etc. -- only 2XX have response.ok === true
            .then( response => response.ok ? response.text() : Promise.reject( new Error( `error.${response.status}` ) ) )
            .then( html => this.loadPage( html ) )
            .catch( e => this.displayError( e ) );
    }

    /** Loads an HTML partial page into the main element.
     *
     * @param html {string} HTML page content
     */
    loadPage( html ) {
        while ( this.main.firstChild ) {
            this.main.firstChild.remove();
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString( html, 'text/html' );
        const node = document.adoptNode( doc.body );
        const children = Array.from( node.childNodes )
            .map( node => {
                // DOMParser script nodes do not work, which is good for your security
                // so, only create a new script node like this if you are sure it's safe
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
    }

    /** Displays an error in the main view.
     *
     * @param e {Error} the error being displayed
     */
    displayError( e ) {
        while ( this.main.firstChild ) {
            this.main.firstChild.remove();
        }
        if ( e.message === 'error.401' ) {
            const signIn = new DemoSignIn();
            this.main.append( signIn );
        } else {
            const error = new DemoError();
            error.messageKey = e.message;
            this.main.append( error );
        }
    }
}

export default DemoMain;

customElements.define( DemoMain.tag, DemoMain );
