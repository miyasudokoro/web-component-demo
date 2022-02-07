import DemoImageInfo from '/src/public/component/demo-image-info.mjs';
import utils from '/src/public/service/utils.mjs';

describe( 'component/DemoImageInfo', () => {
    let element;
    const mockAPI = {
        'https://api.com/1': {
            copyright: 'Juan Pérez'
        },
        'https://api.com/2': {
            copyright: 'Jane Doe'
        },
        'https://api.com/3': {
            copyright: 'Yamada Tarou'
        }
    };

    beforeEach( () => {
        sinon.stub( window, 'fetch' ).callsFake( href => {
            return new Promise( resolve => {
                const result = mockAPI[ href ];
                const status = result ? { status: 200, statusText: 'ok' } : { status: 404, statusText: 'Not Found' };

                // note: you have to use response.clone() so the response body will not count as "already used"
                const response = new Response( JSON.stringify( result ), status ).clone();
                resolve( response );
            } );
        } );
        element = new DemoImageInfo();
        document.body.append( element );
    } );

    describe( 'tags', () => {
        it( 'allows no tags as an empty array', () => {
            expect( element.tags ).to.deep.equal( [] );
            expect( element.hasAttribute( 'tags' ) ).to.be.false();

            const lis = element.shadowRoot.querySelectorAll( 'li' );
            expect( lis.length ).to.equal( 0 );
        } );

        it( 'allows setting normal tags', () => {
            element.tags = [ 'big', 'red', 'apple' ];
            expect( element.tags ).to.deep.equal( [ 'big', 'red', 'apple' ] );
            expect( element.getAttribute( 'tags' ) ).to.equal( 'big,red,apple' );

            const lis = element.shadowRoot.querySelectorAll( 'li' );
            expect( lis.length ).to.equal( 3 );
            expect( lis[ 0 ].textContent ).to.equal( 'big' );
            expect( lis[ 1 ].textContent ).to.equal( 'red' );
            expect( lis[ 2 ].textContent ).to.equal( 'apple' );
        } );

        it( 'does not provide a means of XSS', () => {
            sinon.stub( window, 'alert' );
            element.tags = [ 'big', 'red', '" onload="alert(`attack`)"', "' onload='alert(`attack`)'" ];
            expect( window.alert ).not.to.have.been.called();
            expect( element.onload ).not.to.exist();
            expect( element.getAttribute( 'onload' ) ).not.to.exist();
            expect( element.tags ).to.deep.equal( [ 'big', 'red', '" onload="alert(`attack`)"', "' onload='alert(`attack`)'" ] );
            expect( element.getAttribute( 'tags' ) ).to.equal( 'big,red," onload="alert(`attack`)",\' onload=\'alert(`attack`)\'' );
        } );

        it( 'can read tags written as comma-separated string', () => {
            document.body.insertAdjacentHTML( 'beforeend', `<demo-image-info id="testtags" tags="one,two,three"></demo-image-info>` );
            const embedded = document.getElementById( 'testtags' );
            expect( embedded.tags ).to.deep.equal( [ 'one', 'two', 'three' ] );
        } );

        it( 'limitation: tags with commas will become separated', () => {
            element.tags = [ 'big', 'red', 'apple,pear' ];
            expect( element.tags ).to.deep.equal( [ 'big', 'red', 'apple', 'pear' ] );
            expect( element.getAttribute( 'tags' ) ).to.equal( 'big,red,apple,pear' );
        } );

        describe( 'updating tags', () => {
            beforeEach( () => {
                element.tags = [ 'small', 'orange', 'cat' ];
                const lis = element.shadowRoot.querySelectorAll( 'li' );
                expect( lis.length ).to.equal( 3 );
            } );

            it( 'removes old tags and replaces with new ones', () => {
                element.tags = [ 'medium', 'dog' ];
                const lis = element.shadowRoot.querySelectorAll( 'li' );
                expect( lis.length ).to.equal( 2 );
                expect( lis[ 0 ].textContent ).to.equal( 'medium' );
                expect( lis[ 1 ].textContent ).to.equal( 'dog' );
            } );

            it( 'removes tags', () => {
                element.tags = undefined;
                const lis = element.shadowRoot.querySelectorAll( 'li' );
                expect( lis.length ).to.equal( 0 );
            } );
        } );
    } );

    describe( 'text content properties', () => {
        function _checkTextContentProperties( selector, property ) {
            const content = 'Some text content';
            const inner = element.shadowRoot.querySelector( selector );
            expect( inner.textContent ).to.equal( '' );
            const initialStyle = getComputedStyle( inner );
            expect( initialStyle.getPropertyValue( 'display' ) ).to.equal( 'none' );
            expect( initialStyle.getPropertyValue( 'visibility' ) ).to.equal( 'hidden' );

            element[ property ] = content;

            expect( element[ property ] ).to.equal( content );
            expect( element.getAttribute( property ) ).to.equal( content );
            expect( inner.textContent ).to.equal( content );
            const afterStyle = getComputedStyle( inner );
            expect( afterStyle.getPropertyValue( 'display' ) ).not.to.equal( 'none' ); // several display settings could exist, but not "none"
            expect( afterStyle.getPropertyValue( 'visibility' ) ).to.equal( 'visible' );
        }

        it( 'gets and sets copyright', () => {
            _checkTextContentProperties( 'cite', 'copyright' );
        } );

        it( 'gets and sets title', () => {
            _checkTextContentProperties( 'label', 'title' );
        } );

        it( 'gets and sets explanation', () => {
            _checkTextContentProperties( 'blockquote', 'explanation' );
        } );
    } );

    describe( 'date', () => {
        it( 'sets a normalized date', () => {
            const inner = element.shadowRoot.querySelector( 'time' );
            const day = '2020/5/5';
            const normalized = utils.normalizeDateString( day );
            expect( inner.textContent ).to.equal( '' );
            const initialStyle = getComputedStyle( inner );
            expect( initialStyle.getPropertyValue( 'display' ) ).to.equal( 'none' );
            expect( initialStyle.getPropertyValue( 'visibility' ) ).to.equal( 'hidden' );

            element.date = day;

            expect( element.date ).to.equal( normalized );
            expect( inner.getAttribute( 'datetime' ) ).to.equal( normalized );
            expect( inner.textContent ).to.equal( new Date( normalized ).toLocaleDateString() );
            const afterStyle = getComputedStyle( inner );
            expect( afterStyle.getPropertyValue( 'display' ) ).not.to.equal( 'none' );
            expect( afterStyle.getPropertyValue( 'visibility' ) ).to.equal( 'visible' );
        } );

        it( 'has alias createdAt', () => {
            element.createdAt = '2020-10-10';
            expect( element.createdAt ).to.equal( '2020-10-10' );
            expect( element.date ).to.equal( '2020-10-10' );
            expect( element.getAttribute( 'date' ) ).to.equal( '2020-10-10' );
        } );
    } );
} );
