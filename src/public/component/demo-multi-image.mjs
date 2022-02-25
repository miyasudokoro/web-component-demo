
import DemoImageInfo from './demo-image-info.mjs';
import helper from '../service/helper.mjs';

const TEMPLATE = `
<style>
div {
    display: grid;
    max-width: 100%;
    grid-template-columns: repeat(auto-fill, 350px);
    justify-content: space-between;
}
button {
    padding: 10px 15px;
    font-size: 1em;
    background-color: aliceblue;
    margin: 5px 0;
}
</style>
<template>
    <!-- note: it's easier to work with templates if you have a wrapper element inside -->
    <section>
        <${DemoImageInfo.tag}></${DemoImageInfo.tag}>
        <button name="remove"> x </button>
    </section>
</template>

<button name="add"> + </button>
<div>

</div>
`;

/** @class DemoMultiImage
 * @extends HTMLElement
 * @description Shows multiple DemoImage elements.
 */
class DemoMultiImage extends HTMLElement {
    /** Constructor */
    constructor() {
        super();
        // here is the shadow root
        this.attachShadow( {
            mode: 'open'
            // note: some components need delegatesFocus: true
        } );
        this.shadowRoot.innerHTML = TEMPLATE;
    }

    /** @type {string} */
    static get tag() {
        return 'demo-multi-image';
    }

    /** @type {Array<string>} */
    static get observedAttributes() {
        return [ 'endpoint', 'base' ];
    }

    /** The endpoint to call to get the information about the image/video.
     * @type {string}
     */
    get endpoint() {
        return this.getAttribute( 'endpoint' );
    }
    /** @alias DemoMultiImage.prototype~endpoint */
    set endpoint( endpoint ) {
        if ( !endpoint ) {
            this.removeAttribute( 'endpoint' );
        } else {
            this.setAttribute( 'endpoint', endpoint );
        }
    }

    /** The base URL, if any.
     * @type {string}
     */
    get base() {
        return this.getAttribute( 'base' );
    }
    /** @alias DemoMultiImage.prototype~base */
    set base( base ) {
        if ( !base ) {
            this.removeAttribute( 'base' );
        } else {
            this.setAttribute( 'base', base );
        }
    }

    /** @override */
    connectedCallback() {
        this.add = this.shadowRoot.querySelector( '[name=add]' );
        this.template = this.shadowRoot.querySelector( 'template' );

        // it's best to listen to internal events on shadowRoot
        // because it is a DocumentFragment, not all events will bubble normally to `this`
        this.shadowRoot.addEventListener( 'click', e => {
            if ( e.target.name === 'add' ) {
                this.addNewImage();
            } else if ( e.target.name === 'remove' ) {
                e.target.parentNode.remove();
            }
        } );
        helper.connectedCallback( this );
    }

    /** @override */
    disconnectedCallback() {
        helper.disconnectedCallback( this );
    }

    /** @override */
    attributeChangedCallback( name, _, current ) {
        // passing the state change to the child elements
        Array.from( this.shadowRoot.querySelectorAll( DemoImageInfo.tag ) )
            .forEach( image => ( image[ name ] = current ) );
    }

    /** Adds another DemoImageInfo element and its remover button.
     *
     */
    addNewImage() {
        // note: if you clone this.template.content, because it is a DocumentFragment and not
        // an Element, it will not bubble normal events up
        const clone = this.template // the template element
            .content // the content of the template
            .firstElementChild // the wrapper element on the inside of the template
            .cloneNode( true ); // clone that wrapper and all children

        const info = clone.querySelector( DemoImageInfo.tag );

        // pass the state of this element to the new child element
        helper.copyAttributes( this, info );

        // note this weirdness: it's not really a DemoImageInfo until it's appended
        console.assert( !( info instanceof DemoImageInfo ) );
        const div = this.shadowRoot.querySelector( 'div' );
        div.append( clone );
        console.assert( info instanceof DemoImageInfo );
    }
}

export default DemoMultiImage;

customElements.define( DemoMultiImage.tag, DemoMultiImage );
