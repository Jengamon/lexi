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

fmt:
    yarn workspace frontend fmt
    cargo fmt

clean:
    yarn workspace frontend clean
    cargo clean

build-local $PASSWORD:
    yarn workspace frontend clean
    TAURI_PRIVATE_KEY=$(cat ~/.tauri/lexi.key) TAURI_KEY_PASSWORD=$PASSWORD cargo tauri build
