/**
 * @file test/node.util.js
 * @description Singleton providing globals for Mocha unit tests.
 */

// globals
const sinon = global.sinon = require( 'sinon' );
const chai = require( 'chai' );
const sinonChai = require( 'sinon-chai' );
const dirtyChai = require( 'dirty-chai' );

// record spies for test expectations
let expectedSpies;

// handle unhandled promise rejections
let unhandledPromiseDone;
process.on( 'unhandledRejection', e => unhandledPromiseDone( e ) );

// before all tests...
before( function() {
    // ... connect sinon and chai
    chai.use( sinonChai );
    // ... provide function form of chai
    chai.use( dirtyChai );
} );

// before each test...
beforeEach( function() {
    // ... spy on the expect functions so we will know whether they are called
    expectedSpies = [
        sinon.spy( chai.expect, 'fail' ),
        sinon.spy( chai, 'expect' )
    ];
    // ... set the global "expect" to the spy
    global.expect = chai.expect;
    // ... set the global "fail" to the spy
    global.fail = this.test.error;
    // ... make unhandled promise rejections register as test failures
    /* istanbul ignore next */
    unhandledPromiseDone = e => expect.fail( JSON.stringify( e, null, 2 ) );
} );

// after each test ...
afterEach( function() { // must use "function()" due to needing `this`
    // ... look for one of the expect functions to have been called
    const called = !!expectedSpies.find( spy => spy.called );
    expectedSpies = undefined;
    // ... restore the sinon contexts to their initial state
    sinon.restore();
    // ... create an error for the test that has just ended
    /* istanbul ignore next */
    if ( !called && this.currentTest.state !== 'failed' ) {
        this.test.error( new chai.AssertionError( `Test "${this.currentTest.title}" contained no expect statement` ) );
    }
    /* istanbul ignore next */
    unhandledPromiseDone = e => expect.fail( e );
} );

// canary unit test: proves your test setup works
describe( 'canary', () => {
    const failureTest = 'fails for no expect statement';
    const unhandledPromiseRejectionTest = 'fails for unhandled promise rejections';

    afterEach( function() { // must use "function()" due to needing `this`
        if ( this.currentTest.title === failureTest ) {
            const called = !!expectedSpies.find( spy => spy.called );
            /* istanbul ignore if */
            if ( called ) {
                this.test.error( new chai.AssertionError( `Test "${failureTest}" did not fail` ) );
            } else {
                expect( called ).to.be.false();
            }
        }
    } );

    it( 'adds 2 + 2', () => {
        expect( 2 + 2 ).to.equal( 4 );
    } );

    it( failureTest, () => {} );

    it( unhandledPromiseRejectionTest, () => {
        return new Promise( ( resolve, reject ) => {
            Promise.reject( new Error( unhandledPromiseRejectionTest ) );
            const timeout = setTimeout( /* istanbul ignore next */ () => {
                reject( new chai.AssertionError( `Test "${unhandledPromiseRejectionTest}" timed out` ) );
            }, 100 );
            unhandledPromiseDone = () => {
                clearTimeout( timeout );
                expect( true ).to.be.true();
                resolve();
            };
        } );
    } );
} );
