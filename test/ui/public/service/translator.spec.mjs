import translator from '/src/public/service/translator.mjs';
import { awaitAttributeChange, awaitTextChange } from '/test/ui.util.mjs';

const US = 'en-US';
const UK = 'en-GB';
const SPAIN = 'es-ES';
const JAPAN = 'ja-JP';

const base = `
<h1 i18n="dog.pictures"></h1>
<aside><span i18n="source.api"></span><a href="">Some API name</a></aside>
`;

const fakeEN = `
<h1 i18n="dog.pictures">Dog pictures</h1>
<aside><span i18n="source.api">Source API: </span><a href="">Some API name</a></aside>
`;

const fakeES = `
<h1 i18n="dog.pictures">Fotos de perros</h1>
<aside><span i18n="source.api">API de origen: </span><a href="">Some API name</a></aside>
`;

const fakeJA = `
<h1 i18n="dog.pictures">犬の写真</h1>
<aside><span i18n="source.api">ソースAPI：</span><a href="">Some API name</a></aside>
`;

describe( 'service/translator', () => {
    afterEach( () => {
        translator.reset();
    } );

    it( 'translates what is on the page when initialized', async () => {
        sinon.stub( navigator, 'languages' ).value( [ SPAIN ] );
        document.body.insertAdjacentHTML( 'beforeend', `<div id="x">${base}</div>` );
        const container = document.getElementById( 'x' );

        await translator.initialize();

        expect( container.innerHTML ).to.equal( fakeES );
    } );

    it( 'shows English (US) text if in U.S.', async () => {
        sinon.stub( navigator, 'languages' ).value( [ US ] );
        document.body.insertAdjacentHTML( 'beforeend', `<div id="x">${base}</div>` );
        const container = document.getElementById( 'x' );

        await translator.initialize();

        expect( container.innerHTML ).to.equal( fakeEN );
    } );

    it( 'shows English (US) text if in U.K.', async () => {
        sinon.stub( navigator, 'languages' ).value( [ UK ] );
        document.body.insertAdjacentHTML( 'beforeend', `<div id="x">${base}</div>` );
        const container = document.getElementById( 'x' );

        await translator.initialize();

        expect( container.innerHTML ).to.equal( fakeEN );
    } );

    describe( 'initialized with Spain', () => {
        let container;
        let navStub;

        beforeEach( async () => {
            navStub = sinon.stub( navigator, 'languages' ).value( [ SPAIN ] );
            document.body.insertAdjacentHTML( 'beforeend', `<div id="x">${base}</div>` );
            container = document.getElementById( 'x' );

            await translator.initialize();

            expect( container.innerHTML ).to.equal( fakeES );
        } );

        it( 're-translates if user changes their preferred language', () => {
            navStub.restore();
            navStub = sinon.stub( navigator, 'languages' ).value( [ JAPAN, US ] );

            window.dispatchEvent( new Event( 'languagechange' ) );

            expect( container.innerHTML ).to.equal( fakeJA );

            navStub.restore();
            navStub = sinon.stub( navigator, 'languages' ).value( [ US, JAPAN ] );

            window.dispatchEvent( new Event( 'languagechange' ) );

            expect( container.innerHTML ).to.equal( fakeEN );
        } );

        it( 'translates normal element added to the page', () => {
            const p = document.createElement( 'p' );
            p.setAttribute( 'i18n-title', 'cat.pictures' );
            p.setAttribute( 'i18n', 'cat.pictures' );

            const promise = awaitAttributeChange( p, 'title' );

            container.append( p );

            // this typically takes one event cycle to complete
            return promise.then( () => {
                expect( p.textContent ).to.equal( 'Fotos de gatos' );
                expect( p.getAttribute( 'title' ) ).to.equal( 'Fotos de gatos' );
            } );
        } );

        it( 'translates inside shadow DOM', () => {
            const div = document.createElement( 'div' );
            div.attachShadow( { mode: 'open' } );

            const p = document.createElement( 'p' );
            p.setAttribute( 'i18n-title', 'cat.pictures' );
            p.setAttribute( 'i18n', 'cat.pictures' );

            div.shadowRoot.append( p );

            const promise = awaitAttributeChange( p, 'title' );

            container.append( div );

            return promise.then( () => {
                expect( p.textContent ).to.equal( 'Fotos de gatos' );
                expect( p.getAttribute( 'title' ) ).to.equal( 'Fotos de gatos' );
            } );
        } );

        it( 're-translates if change attribute value', () => {
            const h1 = container.querySelector( 'h1' );
            expect( h1.textContent ).to.equal( 'Fotos de perros' );

            const promise = awaitTextChange( h1 );

            h1.setAttribute( 'i18n', 'cat.pictures' );

            return promise.then( () => {
                expect( h1.textContent ).to.equal( 'Fotos de gatos' );
            } );
        } );
    } );
} );
