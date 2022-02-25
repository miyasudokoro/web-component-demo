# web-component-demo
Demonstration of vanilla web components and their unit tests. This 
is a proof-of-concept showing how vanilla JavaScript can support a 
single-page application (SPA).

## Running the app
1. `npm install` to get dependencies
2. `npm run makeTestCertificates` to set up the localhost HTTPS certificates
3. `npm run start:localhost` to start the server in localhost
4. Navigate to `https://localhost:3000` in your browser and allow the test certificates
5. Visit the "Slideshow" page to learn more about the app

## Why vanilla web components?
- Self-contained and reusable
- Usable in any framework or none
- Synchronous events and lifecycles
- Supported in all modern browsers
  - ... although you'll need a polyfill for customized built-in components in Safari

## About web components
[Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

