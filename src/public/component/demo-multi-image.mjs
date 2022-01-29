
import DemoImageInfo from './demo-image-info.mjs';
import helper from '../service/helper.mjs';

const TEMPLATE = `
<template>
    <!-- note: it's easier to work with templates if you have a wrapper element inside -->
    <section>
        <${DemoImageInfo.tag}></${DemoImageInfo.tag}>
        <button name="remove">Remove image</button>
    </section>
</template>

<button name="add">Add image</button>
`;


class DemoMultiImage extends HTMLElement {
    constructor() {
        super();
        // here is the shadow root
        this.attachShadow( {
            mode: 'open'
            // note: some components need delegatesFocus: true
        } );
    }

    static get tag() {
        return 'demo-multi-image';
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
        return this.getAttribute( 'base' ) || '';
    }
    set base( base ) {
        this.setAttribute( 'base', base || '' );
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = TEMPLATE;
        this.add = this.shadowRoot.querySelector( '[name=add]' );
        this.template = this.shadowRoot.querySelector( 'template' );

        // you can listen to internal events on shadowRoot
        // because it is a DocumentFragment, events will not all bubble normally to `this`
        helper.safeEventListener( this, this.shadowRoot, 'click', e => {
            if ( e.target.name === 'add' ) {
                this.addNewImage();
            } else if ( e.target.name === 'remove' ) {
                e.target.parentNode.remove();
            }
        } );
        helper.connectedCallback( this );
    }

    disconnectedCallback() {
        helper.disconnectedCallback( this );
    }

    addNewImage() {
        // note: if you clone this.template.content, because it is a DocumentFragment and not
        // an Element, it will not bubble normal events up
        const clone = this.template // the template element
            .content // the content of the template
            .firstElementChild // the wrapper element on the inside of the template
            .cloneNode( true ); // clone that wrapper and all children

        const info = clone.querySelector( DemoImageInfo.tag );
        helper.assignAttributes( this, info );
        // note this weirdness: it's not really a DemoImageInfo until it's appended
        console.assert( !( info instanceof DemoImageInfo ) );
        this.shadowRoot.append( clone );
        console.assert( info instanceof DemoImageInfo );
    }
}

export default DemoMultiImage;

customElements.define( DemoMultiImage.tag, DemoMultiImage );
