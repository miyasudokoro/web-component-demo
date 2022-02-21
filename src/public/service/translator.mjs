
const DEFAULT_LOCALE = 'en-us';
let observer;
let currentLocale;
let translations;

function initialize() {
    return fetchTranslations()
        .then( response => {
            translations = response;

            setCurrentLocale();
            createListener();
            createObserver();
        } );
}

function reset() {
    translations = undefined;
    observer && observer.disconnect();
    observer = undefined;
    currentLocale = undefined;
    window.removeEventListener( 'languagechange', setCurrentLocale );
}

function fetchTranslations() {
    const response = {
        'en-us': {
            'dog.pictures': 'Dog pictures',
            'cat.pictures': 'Cat pictures',
            'source.api': 'Source API: '
        },
        'es-es': {
            'dog.pictures': 'Fotos de perros',
            'cat.pictures': 'Fotos de gatos',
            'source.api': 'API de origen: '
        },
        'ja-jp': {
            'dog.pictures': '犬の写真',
            'cat.pictures': '猫の写真',
            'source.api': 'ソースAPI：'
        }
    };
    return Promise.resolve( response );
}

function createListener() {
    window.addEventListener( 'languagechange', setCurrentLocale );
}

function setCurrentLocale() {
    const locale = findCurrentLocale();
    if ( locale !== currentLocale ) {
        currentLocale = locale;
        deepTranslate( document.body );
    }
}

function findCurrentLocale() {
    const locales = navigator.languages.map( loc => loc.toLowerCase() );
    for ( let i = 0; i < locales.length; i++ ) {
        const locale = locales[ i ];
        if ( translations[ locale ] ) {
            return locale;
        }
        const code = locale.split( '-' )[ 0 ];
        for ( const key in translations ) {
            if ( key.startsWith( code ) ) {
                return key;
            }
        }
    }
    return DEFAULT_LOCALE;
}

/** Creates a mutation observer.
 *
 */
function createObserver() {
    observer = new MutationObserver( mutations => {
        mutations.forEach( mutation => {
            if ( mutation.type === 'attributes' && mutation.attributeName.startsWith( 'i18n' ) ) {
                deepTranslate( mutation.target );
            } else if ( mutation.addedNodes ) {
                for ( const addedNode of mutation.addedNodes ) {
                    if ( addedNode.nodeType !== Node.TEXT_NODE ) {
                        deepTranslate( addedNode );
                    }
                }
            }
        } );
    } );
    observer.observe( document, { childList: true, subtree: true, attributes: true } );
}

/** Translates the parent element and its children.
 *
 * @param parent {Node} the parent node
 */
function deepTranslate( parent ) {
    const iterator = document.createNodeIterator( parent, NodeFilter.SHOW_ELEMENT );
    let node;
    while ( node = iterator.nextNode() ) {
        translateNode( node );
    }
}

/** Translates a node's text and/or attribute content.
 *
 * @param element {Element} the element that may need translating
 */
function translateNode( element ) {
    element.attributes && Array.from( element.attributes )
        .filter( attr => attr.name.startsWith( 'i18n' ) )
        .forEach( ( { name, value } ) => {
            const text = translations[ currentLocale ][ value ] || translations[ DEFAULT_LOCALE ][ value ];
            if ( name === 'i18n' ) {
                element.textContent = text;
            } else {
                const attrName = name.split( 'i18n-' )[ 1 ];
                element.setAttribute( attrName, text );
            }
        } );
}

export default { reset, initialize };
