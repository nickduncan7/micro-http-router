const micro = require('micro');
const Router = require('../');

// Initialize the router
const router = new Router();

const beforeHandler = function (req, res) {
    req.user = {};
    req.user.name = 'John Doe';
}

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