const micro = require('micro');
const Router = require('./');

let router = new Router();

router
    // Standard GET request
    .get('/', (req, res) => {
        return 'Hello, world';
    })
    // GET request with route parameter
    .get('/hello/:foo/world/:bar', (req, res) => {
        return `Your first parameter is ${ req.params.foo } and your second parameter is ${ req.params.bar }.`;
    })
    // POST with async body parsing
    .post('/', async (req, res) => {
        const body = await micro.json(req);
        return body;
    })
    // Delete with route parameter
    .delete('/entity/:id', (req, res) => {
        //deleteEntityById(req.params.id);
        return `Entity with ID ${ req.params.id } deleted.`;
    });

const server = micro((req, res) => router.route(req, res));
server.listen(3000);