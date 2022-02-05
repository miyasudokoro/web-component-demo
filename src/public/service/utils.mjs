// Copyright © 2022 Ricoh Company, Ltd. All rights reserved.

/** @module utils
 * @description Utility functions (pure)
 */

/** Converts a string from snake_case, UPPERCASE_SNAKE_CASE, kabob-case, or PascalCase to camelCase.
 *
 * @param str {string} the string
 * @returns {string} the camelCase version of the string
 */
export function toCamelCase( str ) {
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
export function toKabobCase( str ) {
    return str
        // turn the beginning lower case
        .replace( /^[A-Z]*/g, x => x.toLowerCase() )
        // handle snakes and uppercase kabob
        .replace( /[_-][A-Z]*/g, x => '-' + x.slice( 1 ).toLowerCase() )
        // handle camelCase and PascalCase
        .replace( /[A-Z]/g, x => '-' + x.toLowerCase() );
}

export default { toCamelCase, toKabobCase };
