
import DemoError from './demo-error.mjs';
import helper from '../service/helper.mjs';

const MEDIA_TYPE = {
    image: 'img',
    img: 'img',
    video: 'video'
};

const TEMPLATE = `
<style>
:host {
    --demo-error-text-color: orange;
}
img {
    max-width: 600px;
}
iframe {
    width: 640px;
    height: 360px;
}
img:not([src]), iframe:not([src]), [type=date]:not([value]), figcaption > :not([type=date]):empty {
    display: none;
    visibility: hidden;
}

</style>

<${DemoError.tag}></${DemoError.tag}>
<figure>
    <img />
    <iframe></iframe>
    <figcaption>
        <label></label>
        <cite></cite>
        <time></time>
        <blockquote></blockquote>
        <ul></ul>
    </figcaption>
</figure>
`;

class DemoImageInfo extends HTMLElement {
    constructor() {
        super();
        // here is the shadow root
        this.attachShadow( {
            mode: 'open'
            // note: some components need delegatesFocus: true
        } );
        this.shadowRoot.innerHTML = TEMPLATE;
    }

    static get tag() {
        return 'demo-image-info';
    }

    static get observedAttributes() {
        return [ 'endpoint', 'base', 'media-type', 'copyright', 'title', 'explanation', 'tags', 'date', 'url', 'base', 'error-message' ];
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

    get mediaType() {
        return this.getAttribute( 'media-type' ) || 'img';
    }
    set mediaType( type ) {
        this.setAttribute( 'media-type', MEDIA_TYPE[ type ] );
    }
    set media_type( type ) {
        this.mediaType = type;
    }

    get copyright() {
        return this.getAttribute( 'copyright' );
    }
    set copyright( copyright ) {
        this.setAttribute( 'copyright', copyright );
    }

    get title() {
        return this.getAttribute( 'title' );
    }
    set title( title ) {
        this.setAttribute( 'title', title );
    }

    get explanation() {
        return this.getAttribute( 'explanation' );
    }
    set explanation( explanation ) {
        this.setAttribute( 'explanation', explanation );
    }

    get tags() {
        const tags = this.getAttribute( 'tags' );
        return tags && tags.split( ',' );
    }
    set tags( tagsArray ) {
        const tags = tagsArray ? tagsArray.join( ',' ) : '';
        this.setAttribute( 'tags', tags );
    }

    get date() {
        return this.getAttribute( 'date' );
    }
    set date( date ) {
        this.setAttribute( 'date', date );
    }
    set created_at( date ) {
        this.date = date;
    }

    get url() {
        return this.getAttribute( 'url' );
    }
    set url( url ) {
        this.setAttribute( 'url', url );
    }

    get errorMessage() {
        return this.getAttribute( 'error-message' );
    }
    set errorMessage( errorMessage ) {
        this.setAttribute( 'error-message', errorMessage );
    }

    connectedCallback() {
        helper.connectedCallback( this );
    }

    disconnectedCallback() {
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
                .then( response => response.ok ? response.json() : Promise.reject( new Error( response.status + ' ' + response.statusText ) ) )
                .then( json => this.displayContent( json ) )
                .catch( e => {
                    console.error( e );
                    this.errorMessage = e.message;
                } );
        }
    }

    copyrightAttributeChanged( copyright ) {
        this.shadowRoot.querySelector( 'cite' ).textContent = copyright || '';
    }

    titleAttributeChanged( title ) {
        this.shadowRoot.querySelector( 'label' ).textContent = title || '';
    }

    explanationAttributeChanged( explanation ) {
        this.shadowRoot.querySelector( 'blockquote' ).textContent = explanation || '';
    }

    tagsAttributeChanged() {
        const tags = this.tags;
        const list = this.shadowRoot.querySelector( 'ul' );
        while ( list.firstChild ) {
            list.firstChild.remove();
        }
        list.insertAdjacentHTML( 'beforeend', tags.map( tag => `<li>${tag}</li>` ).join( '' ) );
    }

    dateAttributeChanged( date ) {
        const time = this.shadowRoot.querySelector( 'time' );
        time.setAttribute( 'datetime', date );
        time.textContent = new Date( date ).toLocaleDateString();
    }

    baseAttributeChanged() {
        this._setMediaSource();
    }

    mediaTypeAttributeChanged() {
        this._setMediaSource();
    }

    urlAttributeChanged() {
        this._setMediaSource();
    }

    errorMessageAttributeChanged( message ) {
        const error = this.shadowRoot.querySelector( DemoError.tag );
        error.message = message;
    }

    _setMediaSource() {
        if ( this.url ) {
            const src = ( this.base || '' ) + ( this.url || '' );
            const img = this.shadowRoot.querySelector( 'img' );
            const video = this.shadowRoot.querySelector( 'iframe' );
            if ( this.mediaType === 'video' ) {
                img.removeAttribute( 'src' );
                video.src = src;
            } else {
                video.removeAttribute( 'src' );
                img.src = src;
            }
        }
    }

    displayContent( data ) {
        for ( const property in data ) {
            const descriptor = Object.getOwnPropertyDescriptor( DemoImageInfo.prototype, property );
            if ( descriptor && descriptor.set ) {
                this[ property ] = data[ property ];
            }
        }
    }
}


export default DemoImageInfo;

customElements.define( DemoImageInfo.tag, DemoImageInfo );

