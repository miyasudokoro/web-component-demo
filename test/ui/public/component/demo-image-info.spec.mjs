import DemoImageInfo from '/src/public/component/demo-image-info.mjs';
import utils from '/src/public/service/utils.mjs';

describe( 'component/demo-image-info', () => {
    let element;
    const mockData = {
        media_type: 'image',
        copyright: 'Juan Pérez',
        title: 'Cat falls off chair',
        explanation: 'Juan took this funny picture of his cat falling off a chair.',
        tags: 'cute,funny',
        created_at: '2021-10-10',
        url: 'https://api.com/catpic/3000',
        extra: 'this property is not configured'
    };
    const mockAPI = {
        'https://catpictures.api.com': mockData
    };

    beforeEach( () => {
        // fixture: a fresh web component is added to the DOM before each test
        // ... our ui.setup.mjs file will automatically remove the element after each test case
        element = new DemoImageInfo();
        document.body.append( element );
    } );

    describe( 'tags', () => {
        it( 'allows no tags as an empty array', () => {
            // this entire test case establishes the initial values so our next ones can assume them
            expect( element.hasAttribute( 'tags' ) ).to.be.false();
            expect( element.tags ).to.deep.equal( [] );

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

            element[ property ] = undefined;

            expect( inner.textContent ).to.equal( '' );
            const removedStyle = getComputedStyle( inner );
            expect( removedStyle.getPropertyValue( 'display' ) ).to.equal( 'none' );
            expect( removedStyle.getPropertyValue( 'visibility' ) ).to.equal( 'hidden' );
        }

        it( 'gets, sets, and removes copyright', () => {
            _checkTextContentProperties( 'cite', 'copyright' );
        } );

        it( 'gets, sets, and removes title', () => {
            _checkTextContentProperties( 'label', 'title' );
        } );

        it( 'gets, sets, and removes explanation', () => {
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

        it( 'removes date', () => {
            element.date = '2011-11-11';
            expect( element.date ).to.equal( '2011-11-11' );
            const inner = element.shadowRoot.querySelector( 'time' );

            element.date = '';

            expect( element.date ).to.equal( null );
            expect( inner.textContent ).to.equal( '' );
            const initialStyle = getComputedStyle( inner );
            expect( initialStyle.getPropertyValue( 'display' ) ).to.equal( 'none' );
            expect( initialStyle.getPropertyValue( 'visibility' ) ).to.equal( 'hidden' );
        } );
    } );

    describe( 'media source', () => {
        let img, video;

        beforeEach( () => {
            img = element.shadowRoot.querySelector( 'img' );
            video = element.shadowRoot.querySelector( 'iframe' );
            sinon.stub( img, 'setAttribute' );
            sinon.stub( img, 'removeAttribute' );
            sinon.stub( video, 'setAttribute' );
            sinon.stub( video, 'removeAttribute' );
        } );

        it( 'with base, type video', () => {
            element.base = 'https://base.example.com/';
            element.url = 'my/endpoint';
            element.mediaType = 'video';

            expect( video.setAttribute ).to.have.been.calledWith( 'src', 'https://base.example.com/my/endpoint' );
            expect( img.removeAttribute ).to.have.been.calledWith( 'src' );
        } );

        it( 'without base, type image', () => {
            element.url = 'https://example.com/my/endpoint';
            element.mediaType = 'image';

            expect( img.setAttribute ).to.have.been.calledWith( 'src', 'https://example.com/my/endpoint' );
            expect( video.removeAttribute ).to.have.been.calledWith( 'src' );
        } );
    } );

    describe( 'setting endpoint property', () => {
        // Note: we are stubbing fetchFromEndpoint here because it is an async function and we can't get
        // its promise out of `element.endpoint` attribute-changed-handler to return to Mocha/Chai
        beforeEach( () => {
            sinon.stub( element, 'fetchFromEndpoint' );
        } );

        it( 'setting endpoint property calls fetch', () => {
            element.endpoint = 'https://api.com';
            expect( element.fetchFromEndpoint ).to.have.been.calledWith( 'https://api.com' );
        } );

        it( 'handles missing endpoint', () => {
            element.endpoint = 'https://nope.com';
            expect( element.fetchFromEndpoint ).to.have.been.calledWith( 'https://nope.com' );
            expect( element.fetchFromEndpoint.callCount ).to.equal( 1 );

            element.endpoint = '';

            expect( element.errorMessage ).to.equal( 'Endpoint not configured' );
            expect( element.fetchFromEndpoint.callCount ).to.equal( 1 );
        } );
    } );

    describe( 'fetch from endpoint', () => {
        // now we call fetchFromEndpoint directly, get the promise, and make async test cases
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
        } );

        it( 'handles API error', () => {
            // note: we will stub utils.error so the console will not be called
            sinon.stub( utils, 'error' );

            expect( element.errorMessage ).to.equal( null );

            const promise = element.fetchFromEndpoint( 'https://missing.api.com' );

            // proof that the promise has not yet resolved
            expect( element.errorMessage ).to.equal( null );
            expect( utils.error ).not.to.have.been.called();

            // return a promise to tell Mocha/Chai that it is an async test case
            return promise
                .then( () => {
                    expect( element.errorMessage ).to.equal( '404 Not Found' );

                    expect( utils.error ).to.have.been.called();
                    const error = utils.error.lastCall.firstArg;
                    expect( error instanceof Error ).to.be.true();
                    expect( error.message ).to.equal( '404 Not Found' );
                    expect( window.fetch ).to.have.been.calledWith( 'https://missing.api.com' );
                } );
        } );

        it( 'displays content from API response', () => {
            // 1. ready initial state/fixture
            sinon.stub( utils, 'error' );

            const img = element.shadowRoot.querySelector( 'img' );
            const video = element.shadowRoot.querySelector( 'iframe' );
            sinon.stub( img, 'setAttribute' );
            sinon.stub( img, 'removeAttribute' );
            sinon.stub( video, 'setAttribute' );
            sinon.stub( video, 'removeAttribute' );

            // 2. assert the initial value of any changeable states
            // ... we'll take a little risk and assume an empty element starts empty

            // 3. call the function
            return element.fetchFromEndpoint( 'https://catpictures.api.com' )
                .then( () => {
                    // the promise resolves with void, so we don't have a return value to check

                    // 5. assert any states that could have changed
                    expect( element.copyright ).to.equal( mockData.copyright );
                    expect( element.title ).to.equal( mockData.title );
                    expect( element.explanation ).to.equal( mockData.explanation );
                    expect( element.tags ).to.deep.equal( [ 'cute', 'funny' ] );
                    expect( element.date ).to.equal( mockData.created_at );
                    expect( element.url ).to.equal( mockData.url );
                    expect( element.extra ).to.be.undefined();

                    // 6. assert correct mocking
                    expect( img.setAttribute ).to.have.been.calledWith( 'src', mockData.url );
                    expect( video.removeAttribute ).to.have.been.calledWith( 'src' );
                    expect( window.fetch ).to.have.been.calledWith( 'https://catpictures.api.com' );
                } );
        } );
    } );
} );
