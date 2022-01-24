
const removers = new Map();
const replayers = new Map();

export function connectedCallback( element ) {
    _replayAttributeChangedCallbacks( element );
}

export function disconnectedCallback( element ) {
    removeListeners( element );
    replayers.delete( element );
}

export function attributeChangedCallback( element, name, previous, current ) {
    if ( previous !== current ) {
        if ( element.isConnected ) {
            if ( typeof element[ name + 'AttributeChanged' ] === 'function' ) {
                element[ name + 'AttributeChanged' ]( current, previous );
            }
        } else {
            replayers.set( [ name, previous, current ], element );
        }
    }
}

export function safeEventListener( element, target, ...args ) {
    target.addEventListener( ...args );
    const remover = () => {
        target.removeEventListener( ...args );
        removers.delete( remover );
    };
    removers.set( remover, element );
    return remover;
}

/** Removes registered event listeners for the HTMLElement.
 *
 * @param element {Element} registered element
 */
export function removeListeners( element ) {
    removers.forEach( ( registeredElement, fn ) => {
        if ( registeredElement === element ) {
            fn();
        }
    } );
}

/** Triggers the attribute change handlers for attributes that were set before the element attached.
 *
 * @param element
 * @private
 */
function _replayAttributeChangedCallbacks( element ) {
    replayers.forEach( ( registeredElement, args ) => {
        if ( registeredElement === element ) {
            element.attributeChangedCallback( ...args );
            replayers.delete( args );
        }
    } );
}

export default { safeEventListener, removeListeners, connectedCallback, disconnectedCallback, attributeChangedCallback };
