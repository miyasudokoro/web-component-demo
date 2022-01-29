import DemoImageInfo from './demo-image-info.mjs';
import helper from '../service/helper.mjs';

class DemoImageInfoAstronomy extends DemoImageInfo {
    static get tag() {
        return 'demo-image-info-astronomy';
    }

    connectedCallback() {
        const time = this.shadowRoot.querySelector( 'time' );
        const input = document.createElement( 'input' );
        input.type = 'date';
        input.max = new Date().toISOString().split( 'T' )[ 0 ];
        time.replaceWith( input );

        helper.safeEventListener( this, time, 'input', () => {
            const url = new URL( this.endpoint );
            url.searchParams.set( 'date', time.value );
            // If the user changed the date, the URL changes, and that should trigger a fetch
            this.endpoint = url.href;
        } );
        this.endpoint = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
        super.connectedCallback();
    }

    dateAttributeChanged( date ) {
        const time = this.shadowRoot.querySelector( '[type=date]' );
        time.setAttribute( 'value', date );
    }
}

export default DemoImageInfoAstronomy;

customElements.define( DemoImageInfoAstronomy.tag, DemoImageInfoAstronomy );
