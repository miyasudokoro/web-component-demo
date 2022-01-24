
const SELECTOR = {
    explanation: 'blockquote',
    copyright: 'cite',
    title: 'label',
    date: 'time',
    tags: 'ul'
};

const TEMPLATE = `
<figure>
    <img />
    <video></video>
    <figcaption>
        <label></label>
        <cite></cite>
        <time></time>
        <blockquote></blockquote>
        <ul></ul>
    </figcaption>
</figure>

`;

class DemoFigure extends HTMLElement {
    constructor() {
        super();
        // this custom element does not have a shadow root
        this.innerHTML = TEMPLATE;
    }

    static get tag() {
        return 'demo-figure';
    }

    displayData( data, base ) {
        let mediaTag = 'img';
        for ( const key in data ) {
            const value = data[ key ];
            if ( key === 'media_type' ) {
                mediaTag = value === 'video' ? 'video' : 'img';
            } else {
                const selector = SELECTOR[ key ];
                if ( selector ) {
                    const element = this.querySelector( selector );
                    if ( element instanceof HTMLUListElement ) {
                        value.forEach( val => element.insertAdjacentHTML( 'beforeend', `<li>${val}</li>` ) );
                    } else {
                        element.textContent = value;
                        if ( element instanceof HTMLTimeElement ) {
                            element.datetime = value;
                        }
                    }
                }
            }
        }
        const media = this.querySelector( mediaTag );
        media.src = ( base || '' ) + data.url;
    }
}

export default DemoFigure;

customElements.define( DemoFigure.tag, DemoFigure );
