/** @module translator
 * @description automatically translates on the page
 * Note: There is a defect with nested shadow roots in this version ... working on it :)
 */
const DEFAULT_LOCALE = 'en-us';
let observer;
let currentLocale;
let translations;
const shadowRoots = new WeakSet();

const OBSERVATION_ATTRIBUTES = { childList: true, subtree: true, attributes: true };
const INSERT = /{{(.+?)}}/g;

/** Initializes the translator.
 *
 * @returns {Promise}
 */
function initialize() {
    return fetchTranslations()
        .then( response => {
            translations = response;

            createObserver();
            createListener();
            setCurrentLocale();
        } );
}

/** Resets the translator for unit testing.
 *
 */
function reset() {
    translations = undefined;
    observer && observer.disconnect();
    observer = undefined;
    currentLocale = undefined;
    window.removeEventListener( 'languagechange', setCurrentLocale );
}

/** Fetches the translations.
 *
 * @returns {Promise}
 * @private
 */
function fetchTranslations() {
    const response = {
        'en-us': {
            'animal.pictures': 'Pictures of {{animals}}',
            'cats': 'cats',
            'dogs': 'dogs',
            'astronomy.pictures': 'Astronomy image of the day',
            'zero.pictures': 'Dividing by zero',
            'source.api': 'Source API: ',
            'home': 'Home page',
            'animals': 'Animals',
            'nature': 'Nature',
            'sign.in.to.view': 'Sign in to view this page',
            'username': 'Username',
            'password': 'Password',
            'submit': 'Submit',
            'error.400': 'Invalid form submission',
            'error.401': 'You are not signed in',
            'error.403': 'Action not allowed',
            'error.404': 'Page not found',
            'error.500': 'Server error',
            'favorites': 'Favorite images',
            'drop.here': 'Drag and drop here',
            'remove': 'Drop here to remove from favorites',
            'slideshow': 'Slideshow',
            'none': 'None'
        },
        'es-es': {
            'animal.pictures': 'Fotos de {{animals}}',
            'cats': 'gatos',
            'dogs': 'perros',
            'astronomy.pictures': 'Imagen astron??mica del d??a',
            'zero.pictures': 'Dividiendo por cero',
            'source.api': 'API de origen: ',
            'home': 'P??gina de inicio',
            'animals': 'Animales',
            'nature': 'El natural',
            'sign.in.to.view': 'Inicie sesi??n para ver esta p??gina',
            'username': 'Nombre de usuario',
            'password': 'Contrase??a',
            'submit': 'Enviar',
            'error.400': 'Env??o de formulario no v??lido',
            'error.401': 'No has iniciado sesi??n',
            'error.403': 'Acci??n no permitida',
            'error.404': 'P??gina no encontrada',
            'error.500': 'Error del servidor',
            'favorites': 'Im??genes favoritas',
            'drop.here': 'Arrastra y suelta aqu??',
            'remove': 'Soltar aqu?? para eliminar de favoritos',
            'slideshow': 'Diapositivas',
            'none': 'Ninguna'
        },
        'ja-jp': {
            'animal.pictures': '{{animals}}?????????',
            'cats': '???',
            'dogs': '???',
            'astronomy.pictures': '?????????????????????',
            'zero.pictures': '????????????',
            'source.api': '?????????API???',
            'home': '??????????????????',
            'animals': '??????',
            'nature': '????????????',
            'sign.in.to.view': '????????????????????????????????????????????????????????????????????????',
            'username': '???????????????',
            'password': '???????????????',
            'submit': '??????',
            'error.400': '???????????????????????????',
            'error.401': '?????????????????????????????????',
            'error.403': '???????????????????????????',
            'error.404': '?????????????????????????????????',
            'error.500': '?????????????????????',
            'favorites': '????????????????????????',
            'drop.here': '???????????????????????????????????????????????????',
            'remove': '???????????????????????????????????????????????????????????????',
            'slideshow': '?????????????????????',
            'none': '??????'
        }
    };
    return Promise.resolve( response );
}

/** Creates a listener on language change.
 * @private
 */
function createListener() {
    window.addEventListener( 'languagechange', setCurrentLocale );
}

/** Sets the current locale in various state locations.
 * @private
 */
function setCurrentLocale() {
    const locale = findCurrentLocale();
    if ( locale !== currentLocale ) {
        currentLocale = locale;
        deepTranslate( document.body );
        document.body.setAttribute( 'lang', locale );
        document.documentElement.setAttribute( 'lang', locale );
    }
}

/** Finds the user's current locale.
 * @private
 * @returns {string}
 */
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
 * @private
 */
function createObserver() {
    observer = new MutationObserver( mutations => {
        mutations.forEach( mutation => {
            if ( mutation.type === 'attributes' && mutation.attributeName.startsWith( 'i18n' ) ) {
                translateNode( mutation.target );
            } else if ( mutation.addedNodes ) {
                for ( const addedNode of mutation.addedNodes ) {
                    if ( addedNode.nodeType !== Node.TEXT_NODE ) {
                        deepTranslate( addedNode );
                    }
                }
            }
        } );
    } );
    observer.observe( document, OBSERVATION_ATTRIBUTES );
}

/** Translates the parent element and its children.
 *
 * @param parent {Node} the parent node
 * @private
 */
function deepTranslate( parent ) {
    const iterator = document.createNodeIterator( parent, NodeFilter.SHOW_ELEMENT );
    let node;
    while ( node = iterator.nextNode() ) {
        translateNode( node );

        // Each shadow DOM is its own "document" and needs to be observed separately
        if ( node.shadowRoot ) {
            deepTranslate( node.shadowRoot );
            if ( !shadowRoots.has( node.shadowRoot ) ) {
                shadowRoots.add( node.shadowRoot );
                observer.observe( node.shadowRoot, OBSERVATION_ATTRIBUTES );
            }
        }
    }
}

/** Translates a node's text and/or attribute content.
 *
 * @param element {Node} the element that may need translating
 * @private
 */
function translateNode( element ) {
    element instanceof Element && Array.from( element.attributes )
        .filter( attr => attr.name.startsWith( 'i18n' ) )
        .forEach( ( { name, value } ) => {
            const text = ( translations[ currentLocale ][ value ] || translations[ DEFAULT_LOCALE ][ value ] || '' )
                .replace( INSERT, ( _, property ) => {
                    const insert = element.getAttribute( 'i18n-insert-' + property );
                    return translations[ currentLocale ][ insert ] || translations[ DEFAULT_LOCALE ][ insert ] || insert || '';
                } );
            if ( name === 'i18n' ) {
                element.textContent = text;
            } else {
                const attrName = name.split( '-' )[ 1 ];
                if ( attrName && attrName !== 'insert' ) {
                    element.setAttribute( attrName, text );
                }
            }
        } );
}

export default { reset, initialize };
