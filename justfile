fresh:
    cd frontend && yarn install
    cargo install tauri-cli --locked

test:
    -cd src-tauri && cargo insta test
    cd src-tauri && cargo insta review

test-ci:
    cd src-tauri && cargo test

dev:
    cargo tauri dev

build:
    cargo tauri build
