import utils from './utils.mjs';

/** @module helper
 * @description Provides custom-element shared code.
 */


/* These maps hold private variables mapped to each object so we can avoid any name-collision
problems that might come from setting the variables directly on the objects. */
const removers = new Map();
const replayers = new Map();

/** Handles the element connecting to the DOM.
 *
 * @param element {HTMLElement} the custom element
 */
export function connectedCallback( element ) {
    _replayAttributeChangedCallbacks( element );
}

/** Handles the element disconnecting from the DOM.
 *
 * @param element {HTMLElement} the custom element
 */
export function disconnectedCallback( element ) {
    callRemoveListeners( element );
    replayers.delete( element );
}

/** Handles the attribute change event. Assumes change handlers exist on the element in
 * format {propertyName}AttributeChanged taking parameters ( currentValue, previousValue ),
 * where the propertyName is the camelCase version of the attribute name.
 *
 * @example `element.setAttribute( 'my-thing', 'xyz' )` would call `element.myThingAttributeChanged( 'xyz', 'previousValueHere' )`
 *
 * @param element {HTMLElement} the custom element on which an attribute has changed
 * @param name {string} attribute name
 * @param previous {string|null} the previous value of the attribute
 * @param current {string|null} the current value of the attribute
 */
export function attributeChangedCallback( element, name, previous, current ) {
    if ( previous !== current ) {
        if ( element.isConnected ) {
            const property = utils.toCamelCase( name );
            if ( typeof element[ property + 'AttributeChanged' ] === 'function' ) {
                element[ property + 'AttributeChanged' ]( current, previous );
            }
        } else {
            replayers.set( [ name, previous, current ], element );
        }
    }
}

/** Creates an event listener with a remover function to prevent memory leaks and zombie event handlers.
 *
 * @param target {HTMLElement|Document|Window} the event target
 * @param args {...any} the event listener arguments
 * @returns {function} event listener remover function
 */
export function safeEventListener( target, ...args ) {
    target.addEventListener( ...args );
    const remover = () => {
        // this makes sure we will be calling `removeEventListener` with identical arguments
        target.removeEventListener( ...args );
        removers.delete( remover );
    };
    removers.set( remover, target );
    return remover;
}

/** Registers a function to be called when the element gets removed from the DOM.
 *
 * @param element {HTMLElement} the custom element
 * @param callback {function} function called on element removal
 */
export function addRemoveListener( element, callback ) {
    removers.set( callback, element );
}

/** Removes registered event listeners for the HTMLElement and all its descendants.
 *
 * @param element {HTMLElement} registered element
 */
export function callRemoveListeners( element ) {
    removers.forEach( ( registeredElement, fn ) => {
        if ( registeredElement === element ) {
            fn();
        }
    } );
    // also recursively remove listeners for the children of this element
    if ( element.shadowRoot ) {
        callRemoveListeners( element.shadowRoot );
    } else {
        Array.prototype.forEach.call( element.childNodes, callRemoveListeners );
    }
}

/** Copies attributes from one element to another. Assumes attributes should be in kabob-case.
 *
 * @param source {HTMLElement} the source of attribute values
 * @param destination {HTMLElement} the element to set the values on
 * @param [attributes] {Array<string>} attributes or properties to set; default: source.constructor.observedAttributes
 */
export function copyAttributes( source, destination, attributes ) {
    attributes = attributes || source.constructor.observedAttributes || [];
    attributes.forEach( attr => {
        const name = utils.toKabobCase( attr );
        const value = source.getAttribute( name );
        value && destination.setAttribute( name, value );
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

export default { safeEventListener, addRemoveListener, callRemoveListeners, connectedCallback, disconnectedCallback, attributeChangedCallback, copyAttributes };
