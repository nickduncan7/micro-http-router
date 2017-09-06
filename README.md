# micro-http-router
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
const Router = require('./');

let router = new Router();

router
    // Standard GET request
    .get('/', (req, res) => {
        return 'Hello, world';
    })
    // GET request with route parameter
    .get('/user/:id', (req, res) => {
        let id = req.params[0];
        return `Your ID was ${ id }.`;
    })
    // POST with async body parsing
    .post('/', async (req, res) => {
        const body = await micro.json(req);
        return body;
    })
    // Delete with route parameter
    .delete('/entity/:id', (req, res) => {
        let id = req.params[0];
        //deleteEntityById(id);
        return `Entity with ID ${ id } deleted.`;
    });

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