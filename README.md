# micro-http-router
[![Build Status](https://travis-ci.org/protocol114/micro-http-router.svg?branch=master)](https://travis-ci.org/protocol114/micro-http-router) [![Coverage Status](https://coveralls.io/repos/github/protocol114/micro-http-router/badge.svg?branch=master)](https://coveralls.io/github/protocol114/micro-http-router?branch=master)

micro-http-router is a simple, Express-like router for [micro](https://github.com/zeit/micro) that uses a radix tree via [radix-router](https://github.com/charlieduong94/radix-router). It supports most, if not all, of the HTTP verbs and tries to be as lightweight and quick as possible.

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
    const first = req.params[0];
    const second = req.params[1];
    return `Your first parameter is ${ first } and your second is ${ second }.`;
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