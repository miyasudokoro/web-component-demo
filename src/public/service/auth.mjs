
const FAKE_TOKEN = 'my-fake-token';
let token;

/** Logs in the user.
 * @returns {Promise}
 */
function logIn() {
    token = FAKE_TOKEN;
    // in real life, this would be an asynchronous task
    return Promise.resolve();
}

/** Logs out the user.
 * @returns {Promise}
 */
function logOut() {
    token = undefined;
    // in real life, this would be an asynchronous task
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
