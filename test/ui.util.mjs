
/**
 * @module ui.util
 * @description Unit test utility functions.
 */

/** The default timeout milliseconds.
 * @const
 * @type {number}
 * @default 100
 */
export const TIMEOUT_MS = 100;

/** Lists files that Karma loaded.
 * Use this if you are having trouble configuring Karma files or proxies.
 */
export function listFiles() {
    console.log( 'List of files loaded by Karma:' );
    for ( const file in window.__karma__.files ) {
        console.log( file );
    }
}

/** Resolves when the attribute changes on the element. Rejects if the change does not occur within the timeout.
 *
 * @param element {HTMLElement} the element with an attribute that might change
 * @param attribute {string} the attribute name
 * @param [ms=TIMEOUT_MS] {number} the timeout in milliseconds
 */
export function awaitAttributeChange( element, attribute, ms = TIMEOUT_MS ) {
    const promise = new Promise( resolve => {
        const original = element.getAttribute( attribute );
        const observer = new MutationObserver( mutations => {
            mutations.forEach( mutation => {
                if ( mutation.type === 'attributes' && mutation.attributeName === attribute ) {
                    // note: if no value, element has null but mutation.value has undefined
                    const value = element.getAttribute( attribute );
                    if ( value !== original ) {
                        observer.disconnect();
                        resolve( value );
                    }
                }
            } );
        } );
        observer.observe( element, { attributes: true } );
    } );

    return timeOutPromise( promise, `${attribute} did not change in ${ms}ms`, ms );
}

/** Resolves when the text content changes on the element, whitespaces ignored. Rejects if the change does not occur within the timeout.
 *
 * @param element {HTMLElement} the element with an attribute that might change
 * @param [ms=TIMEOUT_MS] {number} the timeout in milliseconds
 */
export function awaitTextChange( element, ms = TIMEOUT_MS ) {
    const promise = new Promise( resolve => {
        const original = getNormalizedWhitespaceTextContent( element );
        const observer = new MutationObserver( () => {
            const currentObservation = getNormalizedWhitespaceTextContent( element );
            if ( original !== currentObservation ) {
                observer.disconnect();
                resolve( currentObservation );
            }
        } );

        const options = { characterData: true, attributes: true, childList: true, subtree: true };
        observer.observe( element, options );
    } );

    return timeOutPromise( promise, `Text content did not change in ${ms}ms`, ms );
}

/** Times out a promise that might hang so your tests can fail faster.
 *
 * @param promise {Promise} the promise that might hang
 * @param [timeoutMessage] {string} a message to reject with
 * @param [ms=TIMEOUT_MS] {number} the timeout in milliseconds
 * @returns {Promise}
 */
export function timeOutPromise( promise, timeoutMessage, ms = TIMEOUT_MS ) {
    timeoutMessage = timeoutMessage || `Promise timed out at ${ms}ms`;
    const timeout = new Promise( ( _, reject ) => {
        setTimeout(
            () => reject( timeoutMessage ),
            ms
        );
    } );

    return Promise.race( [ timeout, promise ] );
}

/** Returns the text content, trimmed and whitespaces normalized.
 *
 * @param element {Element} element
 * @returns {string} the text content
 */
export function getNormalizedWhitespaceTextContent( element ) {
    return element.textContent
        .trim()
        .replace( /\s+/gm, ' ' );
}
