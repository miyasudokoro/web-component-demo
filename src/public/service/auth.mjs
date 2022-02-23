import { SERVER_LOCATION } from './constants.mjs';

let token;

/** Logs in the user.
 * @param form {DemoSignIn} the form
 * @returns {Promise}
 */
function logIn( form ) {
    const request = new Request( [ SERVER_LOCATION, 'login' ].join( '/' ), {
        method: 'POST',
        body: JSON.stringify( form ) // see DemoSignIn toJSON
    } );
    return fetch( request )
        .then( response => {
            return response.json().then( json => {
                if ( response.ok ) {
                    token = json.access_token;
                } else {
                    throw json;
                }
            } );
        } );
}

/** Logs out the user.
 * @returns {Promise}
 */
function logOut() {
    token = undefined;
    // with a real authentication provider, this would probably be an asynchronous task
    return Promise.resolve();
}

/** Gets the headers used for a request to our server.
 *
 * @returns {Headers}
 */
function getHeaders() {
    const headers = new Headers();
    if ( token ) {
        headers.set( 'authorization', `Bearer ${token}` );
    }
    return headers;
}

/** Reset things for unit tests.
 *
 */
function reset() {
    token = undefined;
}

export default { logIn, logOut, getHeaders, reset };
