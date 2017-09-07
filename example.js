const micro = require('micro');
const Router = require('./');

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