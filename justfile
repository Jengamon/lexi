fresh:
    yarn install
    cargo install tauri-cli --locked

fresh-ci:
    yarn install

test:
    cargo deny check
    -cargo insta test
    cargo insta review

test-ci:
    cargo test

dev:
    yarn workspace frontend dev

build:
    yarn workspace frontend build
