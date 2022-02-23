import DemoMultiImage from '/src/public/component/demo-multi-image.mjs';
import DemoImageInfo from '/src/public/component/demo-image-info.mjs';

describe( 'component/demo-multi-image', () => {
    let multi;
    beforeEach( () => {
        multi = new DemoMultiImage();
        document.body.append( multi );
        // note: test/ui.setup.mjs code will remove this from the DOM at the end of the test
    } );

    it( 'sets state', () => {
        multi.endpoint = '/endpoint/';
        multi.base = 'https://something.com';
        expect( multi.endpoint ).to.equal( '/endpoint/' );
        expect( multi.getAttribute( 'endpoint' ) ).to.equal( '/endpoint/' );
        expect( multi.base ).to.equal( 'https://something.com' );
        expect( multi.getAttribute( 'base' ) ).to.equal( 'https://something.com' );
    } )

    it( 'passes state to the added image elements', () => {
        sinon.stub( DemoImageInfo.prototype, 'fetchFromEndpoint' ).resolves(); // stop the child elements from fetching
        multi.endpoint = '/endpoint/';
        multi.base = 'https://something.com';
        expect( multi.shadowRoot.querySelector( DemoImageInfo.tag ) ).to.be.null();

        multi.addNewImage();
        multi.addNewImage();

        const images = multi.shadowRoot.querySelectorAll( DemoImageInfo.tag );
        expect( images.length ).to.equal( 2 );
        expect( images[ 0 ].endpoint ).to.equal( multi.endpoint );
        expect( images[ 1 ].endpoint ).to.equal( multi.endpoint );
        expect( images[ 0 ].base ).to.equal( multi.base );
        expect( images[ 1 ].base ).to.equal( multi.base );
    } );

    describe( 'after adding images', () => {
        let images;

        beforeEach( () => {
            sinon.stub( DemoImageInfo.prototype, 'fetchFromEndpoint' ).resolves(); // stop the child elements from fetching
            multi.endpoint = '/endpoint/';
            multi.base = 'https://something.com';
            expect( multi.shadowRoot.querySelector( DemoImageInfo.tag ) ).to.be.null();

            multi.addNewImage();
            multi.addNewImage();

            images = multi.shadowRoot.querySelectorAll( DemoImageInfo.tag );
            expect( images.length ).to.equal( 2 );
            expect( images[ 0 ].endpoint ).to.equal( multi.endpoint );
            expect( images[ 1 ].endpoint ).to.equal( multi.endpoint );
            expect( images[ 0 ].base ).to.equal( multi.base );
            expect( images[ 1 ].base ).to.equal( multi.base );
        } );

        it( 'passes state changes to the added image elements', () => {
            multi.endpoint = '/different/endpoint';

            expect( images[ 0 ].endpoint ).to.equal( '/different/endpoint' );
            expect( images[ 1 ].endpoint ).to.equal( '/different/endpoint' );

            multi.base = undefined;

            expect( images[ 0 ].base ).to.equal( null );
            expect( images[ 1 ].base ).to.equal( null );
        } );

        it( 'removes an image', () => {
            expect( images[ 1 ].isConnected ).to.be.true();

            images[ 1 ].nextElementSibling.click();

            const updated = multi.shadowRoot.querySelectorAll( DemoImageInfo.tag );
            expect( updated.length ).to.equal( 1 );
            expect( images[ 1 ].isConnected ).to.be.false();
        } );

        it( 'adds image on button click', () => {
            multi.add.click();

            const updated = multi.shadowRoot.querySelectorAll( DemoImageInfo.tag );
            expect( updated.length ).to.equal( 3 );
            expect( updated[ 2 ].endpoint ).to.equal( multi.endpoint );
            expect( updated[ 2 ].base ).to.equal( multi.base );
        } );
    } );
} );
