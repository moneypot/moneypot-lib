hookedin-lib is a javascript library that fully implements the hookedin primitives. 


Design Goals
* Pure javascript for browsers and node.js compatibility

Although we use some cutting-edge bigint stuff ( https://caniuse.com/#search=bigint ) so wide browser support doesn't exist yet.


* No Dependencies

npm has proven to be a security nightmare, so by avoiding the use of dependencies we keep things simple and easy to audit. Note: there are some dev-dependencies, but they're not required.


Warning:
-------
Everything is extremely alpha, and subject to change. Use at your own peril.
