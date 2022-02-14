// Copyright © 2022 Ricoh Company, Ltd. All rights reserved.

/** @module utils
 * @description Utility functions (pure)
 */

/** Converts a string from snake_case, UPPERCASE_SNAKE_CASE, kabob-case, or PascalCase to camelCase.
 *
 * @param str {string} the string
 * @returns {string} the camelCase version of the string
 */
function toCamelCase( str ) {
    return str
        // turn the beginning lower case
        .replace( /^[A-Z]*/g, x => x.toLowerCase() )
        // handle kabobs and snakes
        .replace( /[-_].+/g, x => x[ 1 ].toUpperCase() + x.slice( 2 ).toLowerCase() );
}

/** Converts a string from snake_case, UPPERCASE_SNAKE_CASE, camelCase, or PascalCase to kabob-case.
 *
 * @param str {string} the string
 * @returns {string} the kabob-case version of the string
 */
function toKabobCase( str ) {
    return str
        // turn the beginning lower case
        .replace( /^[A-Z]*/g, x => x.toLowerCase() )
        // handle snakes and uppercase kabob
        .replace( /[_-][A-Z]*/g, x => '-' + x.slice( 1 ).toLowerCase() )
        // handle camelCase and PascalCase
        .replace( /[A-Z]/g, x => '-' + x.toLowerCase() );
}

/** Normalize a possibly-invalid date string to a valid structure of YYYY-MM-DD.
 *
 * @param [dateString] {string} a date string, default today
 * @returns {string} normalized date string in structure YYYY-MM-DD, or empty string for invalid date
 */
function normalizeDateString( dateString ) {
    // strangely, undefined and empty are not the same thing to the Date constructor
    const date = dateString ? new Date( dateString ) : new Date();
    // isNaN implicitly casts to Number
    if ( !isNaN( date ) ) {
        return date.toISOString().split( 'T' )[ 0 ];
    }
    return '';
}

/** By wrapping the console, we can stub calls to it without affecting the unit tests' console output.
 *
 * @param messages {...any} things to log
 */
function error( ...messages ) {
    console.error( ...messages );
}

export default { toCamelCase, toKabobCase, normalizeDateString, error };
