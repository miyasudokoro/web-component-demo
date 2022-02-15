
import utils from '/src/public/service/utils.mjs';

describe( 'service/utils', () => {
    describe( 'to camelCase', () => {
        it( 'converts kabob-case to camelCase', () => {
            expect( utils.toCamelCase( 'some-attribute' ) ).to.equal( 'someAttribute' );
        } );

        it( 'converts UPPERCASE-KABOB-CASE to camelCase', () => {
            expect( utils.toCamelCase( 'SOME-ATTRIBUTE' ) ).to.equal( 'someAttribute' );
        } );

        it( 'converts snake_case to camelCase', () => {
            expect( utils.toCamelCase( 'some_attribute' ) ).to.equal( 'someAttribute' );
        } );

        it( 'converts PascalCase to camelCase', () => {
            expect( utils.toCamelCase( 'SomeAttribute' ) ).to.equal( 'someAttribute' );
        } );

        it( 'converts UPPERCASE_SNAKE_CASE to camelCase', () => {
            expect( utils.toCamelCase( 'SOME_ATTRIBUTE' ) ).to.equal( 'someAttribute' );
        } );

        it( 'does nothing to camelCase', () => {
            expect( utils.toCamelCase( 'someAttribute' ) ).to.equal( 'someAttribute' );
        } );

        it( 'converts uppercase string', () => {
            expect( utils.toCamelCase( 'ATTRIBUTE' ) ).to.equal( 'attribute' );
        } );

        it( 'does nothing to lowercase string', () => {
            expect( utils.toCamelCase( 'attribute' ) ).to.equal( 'attribute' );
        } );
    } );

    describe( 'to kabob-case', () => {
        it( 'converts camelCase to kabob-case', () => {
            expect( utils.toKabobCase( 'someAttribute' ) ).to.equal( 'some-attribute' );
        } );

        it( 'converts UPPERCASE-KABOB-CASE to kabob-case', () => {
            expect( utils.toKabobCase( 'SOME-ATTRIBUTE' ) ).to.equal( 'some-attribute' );
        } );

        it( 'converts snake_case to kabob-case', () => {
            expect( utils.toKabobCase( 'some_attribute' ) ).to.equal( 'some-attribute' );
        } );

        it( 'converts PascalCase to kabob-case', () => {
            expect( utils.toKabobCase( 'SomeAttribute' ) ).to.equal( 'some-attribute' );
        } );

        it( 'converts UPPERCASE_SNAKE_CASE to kabob-case', () => {
            expect( utils.toKabobCase( 'SOME_ATTRIBUTE' ) ).to.equal( 'some-attribute' );
        } );

        it( 'does nothing to kabob-case', () => {
            expect( utils.toKabobCase( 'some-attribute' ) ).to.equal( 'some-attribute' );
        } );

        it( 'converts uppercase string', () => {
            expect( utils.toKabobCase( 'ATTRIBUTE' ) ).to.equal( 'attribute' );
        } );

        it( 'does nothing to lowercase string', () => {
            expect( utils.toKabobCase( 'attribute' ) ).to.equal( 'attribute' );
        } );
    } );

    describe( 'normalize date string', () => {
        it( 'normalizes YYYY/MM/DD', () => {
            expect( utils.normalizeDateString( '2014/12/10' ) ).to.equal( '2014-12-10' );
        } );

        it( 'normalizes YYYY-MM-DD', () => {
            expect( utils.normalizeDateString( '2014-12-10' ) ).to.equal( '2014-12-10' );
        } );

        it( 'normalizes undefined as today', () => {
            const today = new Date().toISOString();
            const normalized = utils.normalizeDateString();
            expect( normalized ).to.equal( utils.normalizeDateString( today ) );
        } );
    } );
} );
