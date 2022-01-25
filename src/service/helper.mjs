
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
            const property = toPropertyName( name );
            if ( typeof element[ property + 'AttributeChanged' ] === 'function' ) {
                element[ property + 'AttributeChanged' ]( current, previous );
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

/** Finds the camelCase property name of a kebab-case or snake_case attribute name.
 *
 * @param attributeName {string} the kebab-case attribute name
 * @returns {string} the camelCase property name
 * @private
 */
export function toPropertyName( attributeName ) {
    return attributeName
        .replace( /[-_]./gi, x => x[ 1 ].toUpperCase() );
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

export default { safeEventListener, removeListeners, connectedCallback, disconnectedCallback, attributeChangedCallback, toPropertyName };
