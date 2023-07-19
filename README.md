# Lexi Project

Some starting guarantees:
- Only builds of this project might be nonfree. The source code
  will remain open.
- The build process will be kept as simple as possible.

Licensed under MIT until I find a reason not to be.

## About

Lexi is just from my exploration of conlanging, and the absence of
tools that employ all the bits and bobs of linguistics that I want to use
together in one tool.

I theorize that if a system could be built that understands a conlang
from the ground up, then it should be simpler to provide parsing tools
, translation services, and more for me, historical tools.

The downside, of course, is that novel systems range from harder to
impossible to implement.

[`frontend/README.html`](frontend) contains the description of
the internal system of storage and processing used to provide our features.

## Build Process

```sh
just
cargo tauri dev
```

to build:

```sh
cargo tauri build
```
