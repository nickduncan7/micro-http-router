# micro-http-router
[![Build Status](https://travis-ci.org/protocol114/micro-http-router.svg?branch=master)](https://travis-ci.org/protocol114/micro-http-router) [![Coverage Status](https://coveralls.io/repos/github/protocol114/micro-http-router/badge.svg?branch=master)](https://coveralls.io/github/protocol114/micro-http-router?branch=master)

micro-http-router is a simple, Express-like router for [micro](https://github.com/zeit/micro) that uses a radix tree via [radix-router](https://github.com/charlieduong94/radix-router). It supports most, if not all, of the HTTP verbs, and tries to be as lightweight and quick as possible.

## Installation
micro-http-router is an npm package and you should have the latest Node.js and npm installed.

```bash
> npm i --save micro-http-router
```

https://www.npmjs.com/package/micro-http-router

## Usage

```javascript
const micro = require('micro');
const Router = require('micro-http-router');

// Initialize the router
const router = new Router();

// Define a basic GET request
router.route({
    path: '/',
    method: 'GET',
    handler: (req, res) => {
        return 'Hello, world';
    }
});

// Define a basic GET request with a middleware function
router.route({
    path: '/',
    method: 'GET',
    before: (req, res) => {
        req.user = {};
        req.user.name = 'John Doe';
    },
    handler: (req, res) => {
        return `Hello, ${ req.user.name }`;
    }
});

// Express-like routing helpers
router.get('/', (req, res) => {
    return 'Hello, world';
});

// Async body parsing
router.post('/', async (req, res) => {
    const body = await micro.json(req);
    return body;
});

// Any number of route parameters are supported
// Access via the req.params array
router.get('/:first/:second', (req, res) => {
    const first = req.params.first;
    const second = req.params.second;
    return `Your first parameter is ${ first } and your second is ${ second }.`;
});

// Start micro and listen
const server = micro((req, res) => router.handle(req, res));
const port = 3000;
server.listen(port);
console.log(`micro is listening on port: ${ port }`);
```

## Changelog (1.3.0 => 1.5.1)

##### New in 1.5.1
Fixed some potential issues with the unrouting functionality. Upgraded dependencies to remove potential vulnerabilities.

##### New in 1.5.0
Added support for query parameters using WHATWG URL API. The WHATWG URL `.searchParams` object gets transplanted onto the `request` object as `.searchParams` as well for a familiar API for retrieving and manipulating those query parameters.

Also added `unroute(path, method)` function to the router that can be called to delete route handlers, if necessary. It can be used in this manner:

```javascript
// Configure a basic get route
router.get('/', (req, res) => {
    ...
});

// don't want the route? call router.unroute(path, method)!
router.unroute('/',  'GET');

// Now subsequent calls to that route and method will fail, as it no longer exists. 👍
```

You can also remove all configured routes by calling `router.unrouteAll()`, and you can see configured routes and what methods are configured by accessing `router.routes`.

```javascript
const router = new Router();

// Configure the routes
router.get('/foo', (req, res) => {
    ...
});
router.post('/foo', (req, res) => {
    ...
});
router.get('/bar', (req, res) => {
    ...
});

console.log(router.routes);
// Returns:
{ '/foo': [ 'GET', 'POST' ], '/bar': [ 'GET' ] }
```

##### New in 1.3.0
Updated dependencies, including radix-router. The only major change is that in place of a request parameter array, the parameters are added to the `req.params` object in a named fashion. If you define a route as `'/:id'`, instead of using `req.params[0]` to get the passed in ID, you can simply use `req.params.id`. Additionally, merged in [PR #3](https://github.com/protocol114/micro-http-router/pull/3) which adds a full stack trace to the error output when `debug` is set to `true`.

##### New in 1.2.0
Add `debug: true` to the router options object to enable debug logging. Any thrown errors will have their error messages returned as the response body. Useful when developing with micro-http-router and you are unexpectedly receiving 500 Internal Server Errors.

##### New in 1.1.0
Added `before` option to route options. This serves as a single layer of middleware allowing you to do the following:

```javascript
const micro = require('micro');
const Router = require('micro-http-router');

const beforeHandler = function (req, res) {
    req.user = {};
    req.user.name = 'John Doe';
};

// Initialize the router
const router = new Router();

// Define a basic GET request with a middleware function
router.route({
    path: '/',
    method: 'GET',
    before: beforeHandler,
    handler: (req, res) => {
        return `Hello, ${ req.user.name }`;
    }
});

// or define it with your get shorthand
router.get('/', beforeHandler, (req, res) => {
    return `Hello, ${ req.user.name }`;
});

// Start micro and listen
const server = micro((req, res) => router.handle(req, res));
const port = 3000;
server.listen(port);
console.log(`micro is listening on port: ${ port }`);
```

## Tests
`micro-http-router` comes with a few [AVA](https://github.com/avajs/ava) tests to help ensure correct routing behavior.

To execute the tests yourself, simply run:

`npm test`

## License
MIT License

Copyright (c) 2017 Nick Duncan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.