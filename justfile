fresh:
    cd frontend && yarn install
    cargo install tauri-cli --locked

test:
    -cd src-tauri && cargo insta test
    cd src-tauri && cargo insta review

dev:
    cargo tauri dev

build:
    cargo tauri build
