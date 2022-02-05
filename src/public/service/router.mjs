
import { DEFAULT_VIEW, CUSTOM_EVENT } from './constants.mjs';

let observer;
let lastSent;
let _location;

/** Initializes the router module.
 *
 * Note: we pass this parameter so we can supply a mock one in unit tests
 * @param [loc=window.location] {Location} the location
 */
export function initialize( loc = location ) {
    if ( !observer ) {
        _location = loc;
        _createNavigationObserver();
    }
}

/** Resets internal pieces of the module so we can avoid memory leaks during unit tests.
 *
 */
export function reset() {
    window.removeEventListener( 'popstate', _onHashChange );
    window.removeEventListener( 'hashchange', _onHashChange );
    observer && observer.disconnect();
    observer = undefined;
    _location = undefined;
    lastSent = undefined;
}

/** Creates a navigation observer that allows navigation via URL hash (fragment).
 *
 * @private
 */
function _createNavigationObserver() {
    window.addEventListener( 'popstate', _onHashChange );
    window.addEventListener( 'hashchange', _onHashChange );

    observer = new MutationObserver( _onHashChange );
    /*
    observer.observe( document.body, {
        childList: true,
        subtree: true
    } ); */
    _onHashChange();
}

/** Communicates the location hash change.
 * @private
 */
function _onHashChange() {
    const hash = _location.hash.slice( 1 );
    const viewInfo = hash ? hash.split( '/' ) : [ DEFAULT_VIEW ];

    // Example: you can communicate arbitrary global events on document
    if ( lastSent !== viewInfo.join( '/' ) ) {
        lastSent = viewInfo.join( '/' );
        const event = new CustomEvent( CUSTOM_EVENT.VIEW_CHANGE, {
            detail: {
                viewInfo
            }
        } );
        document.dispatchEvent( event );
    }
}

export default { initialize, reset };
