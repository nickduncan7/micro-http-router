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