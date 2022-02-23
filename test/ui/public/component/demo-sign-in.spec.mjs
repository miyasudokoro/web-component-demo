import DemoSignIn from '/src/public/component/demo-sign-in.mjs';
import auth from '/src/public/service/auth.mjs';
import { CUSTOM_EVENT } from '/src/public/service/constants.mjs';

describe( 'component/demo-sign-in', () => {
    let form;
    let container;
    beforeEach( () => {
        container = document.createElement( 'div' );
        form = new DemoSignIn();
        container.append( form );
        document.body.append( container );
    } );

    describe( 'form filled in', () => {
        beforeEach( () => {
            // note: Form.elements gives you all the control elements in order, such as fieldset, input, select, etc.
            const [ _fieldset, username, password ] = form.elements;
            username.value = 'my-user-name';
            password.value = 'fakePassword123';
        } );

        it( 'logs in and dispatches event on success', () => {
            sinon.stub( auth, 'logIn' ).resolves();
            const fake = sinon.fake();
            container.addEventListener( CUSTOM_EVENT.VIEW_REFRESH, fake );

            return form.send()
                .then( () => {
                    expect( auth.logIn ).to.have.been.calledWith( form );
                    expect( fake ).to.have.been.called();
                } );
        } );

        it( 'shows error on failure', () => {
            sinon.stub( auth, 'logIn' ).rejects( {
                messageKey: 'error.400'
            } );
            const fake = sinon.fake();
            container.addEventListener( CUSTOM_EVENT.VIEW_REFRESH, fake );
            const error = form.querySelector( 'demo-error' );

            return form.send()
                .then( () => {
                    expect( auth.logIn ).to.have.been.calledWith( form );
                    expect( fake ).not.to.have.been.called();
                    expect( error.messageKey ).to.equal( 'error.400' );
                    // I trust the unit test of DemoError to make sure translation of 'error.400' works
                } );
        } );

        it( 'creates a JSON object ready to submit to the server', () => {
            expect( form.toJSON() ).to.deep.equal( {
                username: 'my-user-name',
                password: 'fakePassword123'
            } );
        } );

        it( 'submits on button click', () => {
            sinon.stub( form, 'send' );
            const button = form.querySelector( 'button' );
            button.dispatchEvent( new MouseEvent( 'click' ) );
            expect( form.send ).to.have.been.called();
        } );
    } );

    it( 'does not submit if invalid fields', () => {
        sinon.stub( form, 'send' );
        const button = form.querySelector( 'button' );
        button.dispatchEvent( new MouseEvent( 'click' ) );
        expect( form.send ).not.to.have.been.called();
    } );
} );
