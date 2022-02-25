import DemoFavoriteImages from '/src/public/component/demo-favorite-images.mjs';

describe( 'component/demo-favorite-images', () => {
    const IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    function makeDragEvent( eventType, dragType, content ) {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData( dragType, content );
        return new DragEvent( eventType, {
            dataTransfer
        } );
    }

    it( 'gets favorites from local storage', () => {
        const content = [ IMG ];
        sinon.stub( localStorage, 'getItem' ).returns( JSON.stringify( content ) );

        const favorite = new DemoFavoriteImages();
        document.body.append( favorite );

        const slot = favorite.shadowRoot.querySelector( 'slot' );
        const promise = new Promise( resolve => {
            slot.addEventListener( 'slotchange', () => {
                resolve();
            } );
        } );

        return promise.then( () => {
            const elements = slot.assignedElements();
            expect( elements.length ).to.equal( 1 );
            expect( elements[ 0 ].src ).to.equal( IMG );
        } );
    } );

    describe( 'after added', () => {
        let favorite;

        beforeEach( () => {
            const content = [ IMG ];
            sinon.stub( localStorage, 'getItem' ).returns( JSON.stringify( content ) );

            favorite = new DemoFavoriteImages();
            document.body.append( favorite );

            const slot = favorite.shadowRoot.querySelector( 'slot' );
            const promise = new Promise( resolve => {
                slot.addEventListener( 'slotchange', () => {
                    resolve();
                } );
            } );

            return promise.then( () => {
                const elements = slot.assignedElements();
                expect( elements.length ).to.equal( 1 );
                expect( elements[ 0 ].src ).to.equal( IMG );
            } );
        } );

        it( 'adds to favorites', () => {
            // @todo generate a second data URL for this test
            const dataTransfer = new DataTransfer();
            dataTransfer.setData( 'text/plain', IMG );
            const drag = new DragEvent( 'drop', {
                dataTransfer
            } );

            const slot = favorite.shadowRoot.querySelector( 'slot' );
            const promise = new Promise( resolve => {
                slot.addEventListener( 'slotchange', () => {
                    resolve();
                } );
            } );

            const div = favorite.shadowRoot.querySelector( 'div' );

            div.dispatchEvent( drag );

            return promise
                .then( () => {
                    const elements = slot.assignedElements();
                    expect( elements.length ).to.equal( 2 );
                    expect( elements[ 0 ].src ).to.equal( IMG );
                    expect( elements[ 1 ].src ).to.equal( IMG );
                } );
        } );
    } );
} );
