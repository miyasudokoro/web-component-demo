import DemoImageInfo from './demo-image-info.mjs';
import helper from '../service/helper.mjs';

export const ENDPOINT = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';

/** @class DemoImageInfoAstronomy
 * @extends DemoImageInfo
 * @description A DemoImageInfo that has a date input in it. You can change the date to fetch a different image.
 */
export class DemoImageInfoAstronomy extends DemoImageInfo {
    /** @type string */
    static get tag() {
        return 'demo-image-info-astronomy';
    }

    /** @override */
    connectedCallback() {
        const time = this.shadowRoot.querySelector( 'time' );
        const input = document.createElement( 'input' );
        input.type = 'date';
        input.max = new Date().toISOString().split( 'T' )[ 0 ];
        time.replaceWith( input );

        helper.safeEventListener( input, 'input', () => {
            const url = new URL( this.endpoint );
            url.searchParams.set( 'date', input.value );
            // If the user changed the date, the URL changes, and that should trigger a fetch
            // due to DemoImageInfo#endpointAttributeChanged
            this.endpoint = url.href;
        } );

        // we start with today's image of the day
        this.endpoint = ENDPOINT;

        // note: this extends DemoImageInfo, and helper.connectedCallback is called there
        super.connectedCallback();
    }

    // note: this extends DemoImageInfo, and helper.disconnectedCallback and attributeChangedCallback are called there

    /** @override */
    dateAttributeChanged( dateStr ) {
        const input = this.shadowRoot.querySelector( '[type=date]' );
        const date = new Date( dateStr );
        input.value = date.toISOString().split( 'T' )[ 0 ];
        input.dispatchEvent( new InputEvent( 'input' ) );
    }
}

export default DemoImageInfoAstronomy;

customElements.define( DemoImageInfoAstronomy.tag, DemoImageInfoAstronomy );
