
import { DEFAULT_VIEW, CUSTOM_EVENT } from './constants.mjs';

let lastSent;
let _location;

/** Initializes the router module.
 *
 * Note: we pass this parameter so we can supply a mock one in unit tests
 * @param [loc=window.location] {Location} the location
 */
export function initialize( loc = window.location ) {
    if ( !_location ) {
        _location = loc;
        _createNavigationObserver();
        _onHashChange();
    }
}

/** Resets internal pieces of the module so we can avoid memory leaks during unit tests.
 *
 */
export function reset() {
    window.removeEventListener( 'popstate', _onHashChange );
    window.removeEventListener( 'hashchange', _onHashChange );
    _location = undefined;
    lastSent = undefined;
}

/** Navigates to a particular view.
 *
 * @param [view=DEFAULT_VIEW] {string} the desired view, or the default view
 */
export function navigate( view ) {
    view = view || DEFAULT_VIEW;
    window.history.pushState( null, null, _location.pathname + _location.search + '#' + view )
}

/** Creates a navigation observer that allows navigation via URL hash (fragment).
 *
 * @private
 */
function _createNavigationObserver() {
    window.addEventListener( 'popstate', _onHashChange );
    window.addEventListener( 'hashchange', _onHashChange );

    _onHashChange();
}

/** Communicates the location hash change.
 * @private
 */
function _onHashChange() {
    const hash = _location.hash.slice( 1 ) || DEFAULT_VIEW;

    // Example: you can communicate arbitrary global events on document
    if ( lastSent !== hash ) {
        lastSent = hash;
        const event = new CustomEvent( CUSTOM_EVENT.VIEW_CHANGE, {
            detail: {
                viewInfo: hash.split( '/' )
            }
        } );
        document.dispatchEvent( event );
    }
}

export default { initialize, reset };
