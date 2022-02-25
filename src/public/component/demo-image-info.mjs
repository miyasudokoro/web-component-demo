
import DemoError from './demo-error.mjs';
import helper from '../service/helper.mjs';
import utils from '../service/utils.mjs';

const MEDIA_TYPE = {
    image: 'img',
    img: 'img',
    video: 'video'
};

const TEMPLATE = `
<style>
:host {
    --demo-error-text-color: tomato;
}
img {
    max-width: 100%;
}
iframe {
    width: 640px;
    height: 360px;
}
img:not([src]), iframe:not([src]), figcaption > *:empty {
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

/** @class DemoImageInfo
 * @extends HTMLElement
 * @description Shows an image and its information.
 */
class DemoImageInfo extends HTMLElement {
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
        return 'demo-image-info';
    }

    /** @type Array<string> */
    static get observedAttributes() {
        return [ 'endpoint', 'base', 'media-type', 'copyright', 'title', 'explanation', 'tags', 'date', 'url', 'base', 'error-message-key' ];
    }

    /** The endpoint to call to get the information about the image/video.
     * @type {string}
     */
    get endpoint() {
        return this.getAttribute( 'endpoint' );
    }
    // note: use of @alias lets me pass my ESLint rule that requires JSDocs
    /** @alias DemoImageInfo.prototype~endpoint */
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
    /** @alias DemoImageInfo.prototype~base */
    set base( base ) {
        if ( !base ) {
            this.removeAttribute( 'base' );
        } else {
            this.setAttribute( 'base', base );
        }
    }

    /** The media type, either 'img' or 'video'. Videos (from YouTube) get put into an iframe.
     * @type {string}
     */
    get mediaType() {
        return this.getAttribute( 'media-type' ) || 'img';
    }
    /** @alias DemoImageInfo.prototype~mediaType */
    set mediaType( type ) {
        if ( !type ) {
            this.removeAttribute( 'media-type' );
        } else if ( MEDIA_TYPE[ type ] ) {
            this.setAttribute( 'media-type', MEDIA_TYPE[ type ] );
        }
    }

    /** The owner of the copyright of the image/video.
     * @type {string}
     */
    get copyright() {
        return this.getAttribute( 'copyright' );
    }
    /** @alias DemoImageInfo.prototype~copyright */
    set copyright( copyright ) {
        if ( !copyright ) {
            this.removeAttribute( 'copyright' );
        } else {
            this.setAttribute( 'copyright', copyright );
        }
    }

    /** The image/video title.
     * Note: this sets the built-in attribute 'title' and so will become hover text.
     *
     * @type {string}
     */
    get title() {
        return this.getAttribute( 'title' );
    }
    /** @alias DemoImageInfo.prototype~title */
    set title( title ) {
        if ( !title ) {
            this.removeAttribute( 'title' );
        } else {
            this.setAttribute( 'title', title );
        }
    }

    /** The explanation about the image/video.
     * @type {string}
     */
    get explanation() {
        return this.getAttribute( 'explanation' );
    }
    /** @alias DemoImageInfo.prototype~explanation */
    set explanation( explanation ) {
        if ( !explanation ) {
            this.removeAttribute( 'explanation' );
        } else {
            this.setAttribute( 'explanation', explanation );
        }
    }

    /** Tags describing the image/video.
     * Note: this is an array of strings, but it must be stored in the element attribute as a string.
     * @type {Array<string>}
     */
    get tags() {
        const tags = this.getAttribute( 'tags' );
        return tags ? tags.split( ',' ) : [];
    }
    /** @alias DemoImageInfo.prototype~tags */
    set tags( tagsArray ) {
        if ( Array.isArray( tagsArray ) ) {
            this.setAttribute( 'tags', tagsArray.join( ',' ) );
        } else if ( typeof tagsArray === 'string' ) {
            this.setAttribute( 'tags', tagsArray );
        } else if ( !tagsArray ) {
            this.removeAttribute( 'tags' );
        }
    }

    /** The date of the image/video.
     * @type {string}
     */
    get date() {
        return this.getAttribute( 'date' );
    }
    /** @alias DemoImageInfo.prototype~date */
    set date( date ) {
        if ( !date ) {
            this.removeAttribute( 'date' );
        } else {
            this.setAttribute( 'date', date );
        }
    }

    /** Alias of date.
     * @type {string}
     */
    get createdAt() {
        return this.date;
    }
    /** @alias DemoImageInfo.prototype~createdAt */
    set createdAt( date ) {
        this.date = date;
    }

    /** The URL of the image/video.
     * @type {string}
     */
    get url() {
        return this.getAttribute( 'url' );
    }
    /** @alias DemoImageInfo.prototype~url */
    set url( url ) {
        if ( !url ) {
            this.removeAttribute( 'url' );
        } else {
            this.setAttribute( 'url', url );
        }
    }

    /** An error message.
     * @type {string}
     */
    get errorMessageKey() {
        return this.getAttribute( 'error-message-key' );
    }
    /** @alias DemoImageInfo.prototype~errorMessageKey */
    set errorMessageKey( errorMessageKey ) {
        if ( !errorMessageKey ) {
            this.removeAttribute( 'error-message-key' );
        } else {
            this.setAttribute( 'error-message-key', errorMessageKey );
        }
    }

    /** @override */
    connectedCallback() {
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

    /** Acts when the endpoint value changes.
     *
     * @param endpoint
     * @returns {Promise<void>}
     */
    endpointAttributeChanged( endpoint ) {
        if ( !endpoint ) {
            this.errorMessage = 'Endpoint not configured';
        } else {
            this.errorMessage = undefined;
            return this.fetchFromEndpoint( endpoint );
        }
    }

    /** Displays the copyright name.
     *
     * @param copyright {string} name of person who holds the copyright
     */
    copyrightAttributeChanged( copyright ) {
        this.shadowRoot.querySelector( 'cite' ).textContent = copyright || '';
    }

    /** Displays the title.
     *
     * @param title {string} title of the image/video
     */
    titleAttributeChanged( title ) {
        this.shadowRoot.querySelector( 'label' ).textContent = title || '';
    }

    /** Displays the explanation.
     *
     * @param explanation {string} explanation of the image/video
     */
    explanationAttributeChanged( explanation ) {
        this.shadowRoot.querySelector( 'blockquote' ).textContent = explanation || '';
    }

    /** Displays the tags.
     *
     */
    tagsAttributeChanged() {
        const tags = this.tags;
        const list = this.shadowRoot.querySelector( 'ul' );
        while ( list.firstChild ) {
            list.firstChild.remove();
        }
        list.insertAdjacentHTML( 'beforeend', tags.map( tag => `<li>${tag}</li>` ).join( '' ) );
    }

    /** Displays the date.
     *
     * @param dateStr {string} the date of the image/video
     */
    dateAttributeChanged( dateStr ) {
        const time = this.shadowRoot.querySelector( 'time' );
        if ( !dateStr ) {
            time.setAttribute( 'datetime', '' );
            time.textContent = '';
        } else {
            const normalized = utils.normalizeDateString( dateStr );
            if ( dateStr !== normalized ) {
                // fix it; this function will be called a second time due to resetting the attribute
                this.setAttribute( 'date', normalized );
            } else {
                time.setAttribute( 'datetime', dateStr );
                time.textContent = new Date( dateStr ).toLocaleDateString();
            }
        }
    }

    /** Handles the base attribute changing.
     *
     */
    baseAttributeChanged() {
        this._setMediaSource();
    }

    /** Handles the media type attribute changing.
     *
     */
    mediaTypeAttributeChanged() {
        this._setMediaSource();
    }

    /** Handles the url attribute changing.
     * @param url {string} the URL of the image or video
     */
    urlAttributeChanged( url ) {
        this._setMediaSource();
    }

    /** Displays an error message.
     *
     */
    errorMessageKeyAttributeChanged( messageKey ) {
        const error = this.shadowRoot.querySelector( DemoError.tag );
        error.messageKey = messageKey;
    }

    /** Fetches from the given endpoint.
     *
     * @param endpoint {string} the given endpoint
     * @returns {Promise<void>}
     */
    fetchFromEndpoint( endpoint ) {
        return fetch( endpoint )
            .then( response => response.ok ? response.json() : Promise.reject( new Error( `error.${response.status}` ) ) )
            .then( json => this.displayContent( json ) )
            .catch( e => {
                utils.error( e );
                this.errorMessageKey = e.message;
            } );
    }

    /** Displays content fetched from the endpoint.
     *
     * @param data {object} fetched data
     */
    displayContent( data ) {
        for ( const key in data ) {
            // normalize the data's keys into camelCase because this class's properties are camelCase
            const property = utils.toCamelCase( key );
            const descriptor = Object.getOwnPropertyDescriptor( DemoImageInfo.prototype, property );
            if ( descriptor && descriptor.set ) {
                this[ property ] = data[ key ];
            }
        }
    }

    /** Sets the source on the img/video.
     *
     * @private
     */
    _setMediaSource() {
        if ( this.url && this.mediaType ) {
            const src = ( this.base || '' ) + this.url;
            const img = this.shadowRoot.querySelector( 'img' );
            const video = this.shadowRoot.querySelector( 'iframe' );
            if ( this.mediaType === 'video' ) {
                img.removeAttribute( 'src' );
                // note: if I use setAttribute, I can stub it with Sinon in my tests so my test console does not have 404 errors
                video.setAttribute( 'src', src );
            } else {
                video.removeAttribute( 'src' );
                img.setAttribute( 'src', src );
            }
        }
    }
}

export default DemoImageInfo;

customElements.define( DemoImageInfo.tag, DemoImageInfo );
