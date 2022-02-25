# web-component-demo
Demonstration of vanilla web components and their unit tests. This 
is a proof-of-concept showing how vanilla JavaScript can support a 
single-page application (SPA).

## Running the app
1. `npm install` to get dependencies
2. `npm run makeTestCertificates` to set up the localhost HTTPS certificates
3. `npm run start:localhost` to start the server in localhost
4. Navigate to `https://localhost:3000` in your browser and allow the test certificates

## Why vanilla web components?
- Self-contained and reusable
- Usable in any framework or none
- Synchronous events and lifecycles
- Supported in all modern browsers
  - ... although you'll need a polyfill for customized built-in components in Safari

## About web components
[Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)


## Vanilla tools
- Custom HTML elements
- Shadow DOM
- Templates
- CSS custom properties (a.k.a. CSS variables)
- Semantic HTML with aria
- ES6 import/export
- DOMParser
- CustomEvent
- addEventListener
- Observers (MutationObserver, ResizeObserver, IntersectionObserver)

## Features of most Single Page Applications (SPAs)
1. Dynamic loading of content
2. URL routing
3. Architectural standards or requirements
4. Data-binding DOM manipulation, at least one way

## Pieces of an SPA using vanilla tools
1. Dynamic loading of content
   - ES6 import/export
   - DOMParser
   - Templates
2. URL routing
   - MutationObserver
   - Custom HTML elements' attributeChangedCallback
3. Architectural standards
   - Use message-based architecture
   - Use independent components
   - Use inheritance only when you are making small adjustments
4. Two-way data-binding DOM manipulation
   - CSS custom properties
   - Custom HTML elements' attributeChangedCallback
   - CustomEvent and addEventListener

## Gotchas
- slot elements vs shadowRoot child elements vs non-shadow-root children
- differing behavior before and after adding elements to the document
- DOMParser-parsed script elements do not run
- event bubbling through shadowRoots
- browser differences in handling bubbled events, internal focus
