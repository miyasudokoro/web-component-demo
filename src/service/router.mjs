
import { DEFAULT_VIEW, CUSTOM_EVENT } from './constants.mjs';

let observer;

/** Initializes the router module.
 *
 */
export function initialize() {
    _createNavigationObserver();
}

/** Destroys internal pieces of the module so we can avoid memory leaks during unit tests.
 *
 */
export function destroy() {
    observer && observer.disconnect();
}

/** Creates a navigation observer that allows navigation via URL hash (fragment).
 *
 * @private
 */
function _createNavigationObserver() {
    window.addEventListener( 'onpopstate', _onHashChange );
    window.addEventListener( 'hashchange', _onHashChange );

    observer = new MutationObserver( _onHashChange );
    observer.observe( document.body, {
        childList: true,
        subtree: true
    } );
    _onHashChange();
}

/** Communicates the location hash change.
 * @private
 */
function _onHashChange() {
    let viewInfo = location.hash.slice( 1 ).split( '/' );
    if ( !viewInfo || !viewInfo.length ) {
        viewInfo = [ DEFAULT_VIEW ];
    }

    // Example: you can communicate arbitrary global events on document
    const event = new CustomEvent( CUSTOM_EVENT.VIEW_CHANGE, {
        bubbles: true,
        composed: true,
        detail: {
            viewInfo
        }
    } );
    document.dispatchEvent( event );
}

export default { initialize, destroy };
