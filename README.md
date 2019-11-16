# About

[![Dependencies](https://david-dm.org/bershanskiy/vignette.svg)](https://david-dm.org/bershanskiy/vignette)

Skip boring parts of YouTube videos like intros, sponsorship plugs, merch announcements, calls for comments/likes/subscriptions and social media promotions. All without compromising your computer performance, browser security or your privacy!

Inspired by [SponsorBlock](https://github.com/ajayyy/SponsorBlock) by @ajayyy and [VideoSegments](https://github.com/videosegments/videosegments), but uses a completely different approach to doing most things.

[Documentation](docs/index.md)

# Deployment

This project consists of two parts: the browser extension itself and the server that stores the segment data. The server runs on NodeJS 10+ and Express server.

## Server

To deploy the server, just clone this repository,
- install dependencies with `npm install` (and `npm rebuild` to fix `sqlite3` error)
- optionslly, download SponsorBlock database for import `npm run server-database`
- start the server with `npm run server`

# Development

## Extension development

### Building extension

#### Production build
Use `npm run build-prod` to create a production build. Code is minified and is unreadable.

#### Development build
Code is not minified and comments are not removed to simplify debugging. Also, extension is rebuild and reloaded every time a Webpack entry point file is changed.

1. Run `npm run build-dev`
   Use `npm run build-dev` to build the extension and start automatic rebuild when source files change.
2. Load extension into the browser from `build_extension`
   Once the server is running, load the built extension into the browser. In general, extension needs to be loaded into the browser for the first time after starting the server because the server might pick a different Web Sockets port to send information about rebuilds on every run.

#### Pre-commit checklist

Run `npm run test` to check everything at once.

# License

This code is licensed under the terms of MIT license, except portions derived from other works specified individually.
