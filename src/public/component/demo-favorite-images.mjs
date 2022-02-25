
const TEMPLATE = `
<style>
:host {
    padding: 20px;
    display: grid;
    height: 100vh;
    grid-template-rows: max-content auto max-content;
    box-sizing: border-box;
}
label {
    font-size: 1.5em;
    display: block;
    margin: 10px auto;
    text-align: center;
}
div {
    border: 2px solid gray;
    padding: 20px;
    overflow: auto;
}
div[active] {
    border: 2px solid blue;
}
p {
    font-size: 1.2em;
    text-align: center;
}
[remove] {
    font-size: 4em;
    margin: 10px auto;
    text-align: center;
}
[remove][active] {
    color: blue;
}

/* styling inside a slot is limited but possible */
::slotted(img) {
    display: block;
    width: 180px;
    height: 180px;
    object-fit: scale-down;
    margin: 10px auto;
    transition: all .5s ease-in-out;
}
::slotted(img[clicked]) {
    height: 600px;
    width: 600px;
}
::slotted(img[active]) {
    filter: opacity(30%);
}
</style>
<label i18n="favorites"></label>
<div>
    <slot>
        <p i18n="drop.here"></p>
    </slot>
</div>
<p remove i18n-title="remove">&#128465;</p>
`;

const TAG = 'demo-favorite-images';
const REARRANGE = 'favorite-rearrange';

class DemoFavoriteImages extends HTMLElement {
    /** Constructor */
    constructor() {
        super();
        this.attachShadow( {
            mode: 'open'
        } );
    }

    /** @type {string} */
    static get tag() {
        return TAG;
    }

    /** @override */
    connectedCallback() {
        this.shadowRoot.innerHTML = TEMPLATE;

        // get saved favorites
        this._displaySavedFavorites();

        // example of listening for the slotchange event
        const slot = this.shadowRoot.querySelector( 'slot' );
        slot.addEventListener( 'slotchange', e => {
            localStorage.setItem( TAG, JSON.stringify(
                e.target.assignedElements().map( el => el.src )
            ) );
        } );

        this._addContainerDragDrop();
        this._addRemovalDragDrop();
    }

    /** Adds to the list of favorite images.
     *
     * @param src {string} image source
     */
    addToList( src ) {
        const img = document.createElement( 'img' );
        img.src = src;
        img.addEventListener( 'click', () => img.toggleAttribute( 'clicked' ) );
        img.addEventListener( 'dragstart', e => {
            e.dataTransfer.setData( REARRANGE, img.src );
        } );
        img.addEventListener( 'dragover', e => {
            e.preventDefault();
            if ( ![ ...e.dataTransfer.types ].includes( REARRANGE ) ) {
                return false;
            }
            img.toggleAttribute( 'active', true );
        } );
        img.addEventListener( 'dragleave', () => {
            img.toggleAttribute( 'active', false );
        } );
        img.addEventListener( 'drop', e => {
            if ( ![ ...e.dataTransfer.types ].includes( REARRANGE ) ) {
                return false;
            }
            e.preventDefault();
            e.stopPropagation();
            img.toggleAttribute( 'active', false );
            const src = e.dataTransfer.getData( 'text/plain' );
            let n = img;
            let p = img;
            while ( ( n = n?.nextElementSibling ) || ( p = p?.previousElementSibling ) ) {
                if ( n?.src === src ) {
                    this.insertBefore( n, img );
                    return;
                }
                if ( p?.src === src ) {
                    this.insertBefore( p, img.nextSibling );
                    return;
                }
            }
        } );

        // note that if I append to this element, not its shadow root, it goes into the slot
        this.append( img );
    }

    /** Provides the drag-and-drop to add a favorite image.
     *
     * @private
     */
    _addContainerDragDrop() {
        const div = this.shadowRoot.querySelector( 'div' );

        div.addEventListener( 'dragover', ( /** @type {DragEvent} */ e ) => {
            e.preventDefault();
            if ( [ ...e.dataTransfer.types ].includes( REARRANGE ) ) {
                return false;
            }
            // images have src as their automatic text/plain data entry
            const src = e.dataTransfer.getData( 'text/plain' );
            if ( src.includes( 'youtube' ) ) { // no videos
                return false;
            }
            div.toggleAttribute( 'active', true );
        } );
        div.addEventListener( 'dragleave', () => {
            div.toggleAttribute( 'active', false );
        } );
        div.addEventListener( 'drop', ( /** @type {DragEvent} */ e ) => {
            e.preventDefault();
            if ( [ ...e.dataTransfer.types ].includes( REARRANGE ) ) {
                return false;
            }
            const src = e.dataTransfer.getData( 'text/plain' );
            if ( src.includes( 'youtube' ) ) { // no videos
                return false;
            }
            this.addToList( src );
            div.toggleAttribute( 'active', false );
        } );
    }

    /** Provides removal of favorites.
     *
     * @private
     */
    _addRemovalDragDrop() {
        const remove = this.shadowRoot.querySelector( '[remove]' );
        const slot = this.shadowRoot.querySelector( 'slot' );
        remove.addEventListener( 'dragover', e => {
            if ( ![ ...e.dataTransfer.types ].includes( REARRANGE ) ) {
                return false;
            }
            e.preventDefault();
            remove.toggleAttribute( 'active', true );
        } );
        this.shadowRoot.addEventListener( 'dragleave', () => {
            remove.toggleAttribute( 'active', false );
        } );
        remove.addEventListener( 'drop', e => {
            if ( ![ ...e.dataTransfer.types ].includes( REARRANGE ) ) {
                return false;
            }
            e.preventDefault();
            const src = e.dataTransfer.getData( 'text/plain' );
            slot.assignedElements().find( el => el.src === src ).remove();
            remove.toggleAttribute( 'active', false );
        } );
    }

    /** Displays the saved favorites.
     *
     * @private
     */
    _displaySavedFavorites() {
        const existing = localStorage.getItem( TAG );
        if ( existing ) {
            JSON.parse( existing ).forEach( src => this.addToList( src ) );
        }
    }
}

export default DemoFavoriteImages;

customElements.define( DemoFavoriteImages.tag, DemoFavoriteImages );
