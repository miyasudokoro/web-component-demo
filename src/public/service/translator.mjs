
const DEFAULT_LOCALE = 'en-us';
let observer;
let currentLocale;
let translations;
const shadowRoots = new WeakSet();

const OBSERVATION_ATTRIBUTES = { childList: true, subtree: true, attributes: true };

function initialize() {
    return fetchTranslations()
        .then( response => {
            translations = response;

            createObserver();
            createListener();
            setCurrentLocale();
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
            'astronomy.pictures': 'Astronomy Image of the Day',
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
            'error.500': 'Server error'
        },
        'es-es': {
            'dog.pictures': 'Fotos de perros',
            'cat.pictures': 'Fotos de gatos',
            'astronomy.pictures': 'Imagen astronómica del día',
            'zero.pictures': 'Dividiendo por cero',
            'source.api': 'API de origen: ',
            'home': 'Página de inicio',
            'animals': 'Animales',
            'nature': 'El natural',
            'sign.in.to.view': 'Inicie sesión para ver esta página',
            'username': 'Nombre de usuario',
            'password': 'Contraseña',
            'submit': 'Enviar',
            'error.400': 'Envío de formulario no válido',
            'error.401': 'No has iniciado sesión',
            'error.403': 'Acción no permitida',
            'error.404': 'Página no encontrada',
            'error.500': 'Error del servidor'
        },
        'ja-jp': {
            'dog.pictures': '犬の写真',
            'cat.pictures': '猫の写真',
            'astronomy.pictures': '今日の天文画像',
            'zero.pictures': 'ゼロ除算',
            'source.api': 'ソースAPI：',
            'home': 'ホームページ',
            'animals': '動物',
            'nature': '自然科学',
            'sign.in.to.view': 'このページを表示するには、サインインしてください',
            'username': 'ユーザー名',
            'password': 'パスワード',
            'submit': '送信',
            'error.400': '無効なフォーム送信',
            'error.401': 'サインインしていません',
            'error.403': '許可されていません',
            'error.404': 'ページが見つかりません',
            'error.500': 'サーバーエラー'
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
        document.body.setAttribute( 'lang', locale );
        document.documentElement.setAttribute( 'lang', locale );
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
 */
function translateNode( element ) {
    element instanceof Element && Array.from( element.attributes )
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
