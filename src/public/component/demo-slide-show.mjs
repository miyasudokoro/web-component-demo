
import helper from '../service/helper.mjs';

const TEMPLATE = `
<style>
::slotted(label) {
    display: block;
    padding: 5px;
    font-size: 1em;
    margin: 10px;
}
object {
    max-width: 100%;
}
[thumbnails] {
    width: 100%;
    overflow: auto;
    white-space: nowrap;
}
[thumbnails] img {
    width: 100px;
    object-fit: contain;
}
[navigation] {
    display: grid;
    grid-template-columns: 50px auto 50px;
}
button {
    font-size: 2em;
    line-height: 2em;
    background-color: lightblue;
}
button[disabled] {
    background-color: lightgray;
}
</style>

<slot name="choices"></slot>
<object type="image/jpg"></object>
<div navigation>
    <button back disabled> &#9204; </button>
    <div thumbnails></div>
    <button forward disabled> &#9205; </button>
</div>
`;

/** @class DemoSlideShow
 * @extends HTMLElement
 * @description A basic slide show for JPG slides.
 */
class DemoSlideShow extends HTMLElement {
    /** Constructor */
    constructor() {
        super();
        // here is the shadow root
        this.attachShadow( {
            mode: 'open'
            // note: some components need delegatesFocus: true
        } );
    }

    /** @type {string} */
    static get tag() {
        return 'demo-slide-show';
    }

    /** @type Array<string> */
    static get observedAttributes() {
        return [ 'size', 'slides', 'current' ];
    }

    /** The path to the slide images.
     * @type {string}
     */
    get slides() {
        return this.getAttribute( 'slides' );
    }
    // note: use of @alias lets me pass my ESLint rule that requires JSDocs
    /** @alias DemoSlideShow.prototype~slides */
    set slides( slides ) {
        if ( !slides ) {
            this.removeAttribute( 'slides' );
        } else {
            this.setAttribute( 'slides', slides );
        }
    }

    /** The number of slides in the slide show.
     * @type {number}
     */
    get size() {
        return parseInt( this.getAttribute( 'size' ) || 0 );
    }
    /** @alias DemoSlideShow.prototype~size */
    set size( size ) {
        if ( !size ) {
            this.removeAttribute( 'size' );
        } else {
            this.setAttribute( 'size', String( size ) );
        }
    }

    /** The current slide in the slide show.
     * @type {number}
     */
    get current() {
        return parseInt( this.getAttribute( 'current' ) || 0 );
    }
    /** @alias DemoSlideShow.prototype~current */
    set current( current ) {
        if ( !current ) {
            this.removeAttribute( 'current' );
        } else {
            this.setAttribute( 'current', String( current ) );
        }
    }

    /** @override */
    connectedCallback() {
        this.shadowRoot.innerHTML = TEMPLATE;

        this.slideshow = this.shadowRoot.querySelector( 'object' );
        this.forward = this.shadowRoot.querySelector( '[forward]' );
        this.back = this.shadowRoot.querySelector( '[back]' );
        this.forward.addEventListener( 'click', () => {
            this.current += 1;
        } );
        this.back.addEventListener( 'click', () => {
            this.current -= 1;
        } );

        // We can receive the click events of the slotted buttons like this
        this.addEventListener( 'click', e => {
            if ( e.target instanceof HTMLInputElement ) {
                this.size = e.target.getAttribute( 'size' ) || 1;
                this.slides = e.target.value;
                this.setThumbnails();
            }
        } );
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

    /** When we know what the source of the slides is.
     * @param slides {string} the source path
     */
    slidesAttributeChanged( slides ) {
        if ( this.current === 1 ) {
            this.loadSlide();
        } else {
            this.current = 1; // will trigger load after the current slide number changes
        }
    }

    /** Change of the current slide.
     *
     */
    currentAttributeChanged() {
        this.loadSlide();
        this.resetBackForward();
    }

    /** Change of the size of the slide show.
     *
     */
    sizeAttributeChanged() {
        if ( this.size > this.current ) {
            this.current = 1;
        }
        this.resetBackForward();
    }

    /** Loads a slide.
     *
     */
    loadSlide() {
        if ( this.slides ) {
            this.slideshow.data = this.getSlideURL( this.current );
        } else {
            this.slideshow.removeAttribute( 'data' );
        }
    }

    /** Gets a slide URL.
     *
     * @param number {number} the number of the slide
     * @returns {string}
     */
    getSlideURL( number ) {
        if ( this.slides ) {
            return `${this.slides}/${String( number ).padStart( 4, '0' )}.jpg`;
        }
    }

    /** Resets the back and forward buttons.
     *
     */
    resetBackForward() {
        this.back.toggleAttribute( 'disabled', this.size < 2 || this.current === 1 );
        this.forward.toggleAttribute( 'disabled', this.size < 2 || this.current >= this.size );
    }

    /** Sets the thumbnails.
     *
     */
    setThumbnails() {
        const thumbs = this.shadowRoot.querySelector( '[thumbnails]' );
        while ( thumbs.firstChild ) {
            thumbs.firstChild.remove();
        }
        if ( this.slides ) {
            for ( let i = 1; i <= this.size; i++ ) {
                const img = this._makeThumbnail( i );
                thumbs.append( img );
            }
        }
    }

    /** Makes a thumbnail.
     *
     * @param number {number} the number of the slide
     * @returns {HTMLImageElement}
     * @private
     */
    _makeThumbnail( number ) {
        const img = document.createElement( 'img' );
        img.src = this.getSlideURL( number );
        img.addEventListener( 'click', () => {
            this.current = number;
        } );
        return img;
    }
}

export default DemoSlideShow;

customElements.define( DemoSlideShow.tag, DemoSlideShow );
