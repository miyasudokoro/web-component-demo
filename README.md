# web-component-demo
Demonstration of vanilla web components and their unit tests.

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
4. Two-way data-binding DOM manipulation
   - CSS custom properties
   - Custom HTML elements' attributeChangedCallback
   - CustomEvent and addEventListener
