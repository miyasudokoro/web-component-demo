import auth from '../service/auth.mjs';
import { CUSTOM_EVENT } from '../service/constants.mjs';

const TEMPLATE = `
<style>
h1 {  
    font-size: 2em;
    font-weight: normal;
    margin-top: 50px;
}
fieldset {
    border: none;
    margin-top: 30px;
}
fieldset label {
    display: flex;
    width: 300px;
    justify-content: space-between;
    margin-bottom: 10px;
}
fieldset input {
    padding: 4px;
}
fieldset button {
    display: block;
    padding: 10px;
    font-size: 1em;
    background-color: azure;
    margin: 5px 0;
    border-radius: 10px;
    width: 300px;
}
</style>
<h1 i18n="sign.in.to.view"></h1>
<demo-error></demo-error>
<fieldset>
    <label>
        <span i18n="username"></span>   
        <input type="text" name="username" autocomplete="username" required minlength="3" maxlength="20" pattern="^\\S+$"/> 
    </label>
    
    <label>
        <span i18n="password"></span>   
        <input type="password" name="password" autocomplete="password" required minlength="8" /> 
    </label>
    
    <button type="submit" i18n="submit"></button>
</fieldset>
`;

/** @class DemoSignIn
 * @extends HTMLFormElement
 * @description Signs in the user.
 * IMPORTANT NOTE: Extending elements other than HTMLElement
 *    - requires a polyfill to run in Safari
 *    - uses format <base is="custom-tag-here"></base>
 *        - example: <form is="demo-sign-in"></form>
 */
class DemoSignIn extends HTMLFormElement {
    /** Constructor */
    constructor() {
        super();
        // if you want browser auto-complete to work, you must keep your inputs out of the Shadow DOM
    }

    /** @type {string} */
    static get tag() {
        return 'demo-sign-in';
    }

    /** @override */
    connectedCallback() {
        this.innerHTML = TEMPLATE;
        // Note: you get submit-by-hitting-Enter automatically because this is extending HTMLFormElement
        this.addEventListener( 'submit', e => {
            e.preventDefault();
            this.send();
        } );
    }

    /** Sends form data.
     *
     * @returns {Promise<unknown>}
     */
    send() {
        const error = this.querySelector( 'demo-error' );
        error.messageKey = undefined;
        return auth.logIn( this )
            .then(
                // make the parent DemoMain refresh
                () => this.dispatchEvent( new CustomEvent( CUSTOM_EVENT.VIEW_REFRESH, { bubbles: true, composed: true } ) ),
                // display the error
                json => ( error.messageKey = json.messageKey )
            );
    }

    /** Quick JSON version of the form.
     *
     * @returns {object} JSON object
     */
    toJSON() {
        // note: Form.elements gives you all the control elements, such as fieldset, input, select, etc.
        return Array.from( this.elements )
            .reduce( ( obj, input ) => {
                if ( input.name ) {
                    obj[ input.name ] = input.value;
                }
                return obj;
            }, {} );
    }
}

export default DemoSignIn;

customElements.define( DemoSignIn.tag, DemoSignIn, { extends: 'form' } );
