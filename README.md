# Lexi Project

Some starting guarantees:
- Only builds of this project might be nonfree. The source code
  will remain open. 
- The build process will be kept as simple as possible.

Licensed under MIT until I find a reason not to be.

## About

Lexi is just from my exploration of conlanging, and the absence of
tools that employ all the bits and bobs of linguistics.

I theorize that if a system could be built that understands a conlang
from the ground up, then it should be simpler to provide parsing tools
and translation services.

The downside, of course, is that novel systems range from harder to
impossible to implement, so we must, of course, strike a balance.

[`frontend/README.html`](frontend) contains the description of
the internal system of storage and processing we use to provide our features. 

## Build Process

```sh
cd frontend
yarn install
cd ..
cargo install tauri-cli --locked
cargo tauri build
```
