import DemoImageInfo from './demo-image-info.mjs';
import helper from '../service/helper.mjs';
import utils from '../service/utils.mjs';

// note that DEMO_KEY is restricted to a certain number of requests
export const ENDPOINT = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';

const INSERT = `
<style>
/* reset from parent */
figcaption > [type=date] {
    display: block;
    visibility: visible;
}
figcaption > [type=date]:not([value]) {
    display: none;
    visibility: hidden;
}
img {
    max-width: 90%;
    display: block;
    margin: auto;
}
</style>
`;

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
        const today = utils.normalizeDateString();
        const time = this.shadowRoot.querySelector( 'time' );
        const input = document.createElement( 'input' );
        input.type = 'date';
        input.max = today;
        time.replaceWith( input );

        helper.safeEventListener( input, 'input', () => this.fetchFromEndpoint() );

        // we start with today's image of the day
        this.endpoint = ENDPOINT;

        // note: this extends DemoImageInfo, and helper.connectedCallback is called there
        super.connectedCallback();
        // provide style overrides
        const parentStyle = this.shadowRoot.querySelector( 'style' );
        parentStyle.insertAdjacentHTML( 'afterend', INSERT );
    }

    // note: this extends DemoImageInfo, and helper.disconnectedCallback and attributeChangedCallback are called there

    /** @override */
    dateAttributeChanged( dateStr ) {
        const normalized = utils.normalizeDateString( dateStr );
        if ( dateStr && dateStr !== normalized ) {
            // fix it; this function will be called a second time due to resetting the attribute
            this.setAttribute( 'date', normalized );
        } else {
            const input = this.shadowRoot.querySelector( '[type=date]' );
            input.setAttribute( 'value', dateStr ); // we set this so it can be seen by CSS
            input.value = dateStr; // we set this so it has a correct property value
            this.fetchFromEndpoint();
        }
    }

    /** @override */
    fetchFromEndpoint( endpoint ) {
        const url = new URL( endpoint || this.endpoint );
        const input = this.shadowRoot.querySelector( '[type=date]' );
        // Either the input's value or none (today)
        if ( input.value ) {
            url.searchParams.set( 'date', input.value );
        }
        // If the user changed the date, the URL changes, and that should trigger a fetch
        // due to DemoImageInfo#endpointAttributeChanged
        return super.fetchFromEndpoint( url.href );
    }
}

export default DemoImageInfoAstronomy;

customElements.define( DemoImageInfoAstronomy.tag, DemoImageInfoAstronomy );
