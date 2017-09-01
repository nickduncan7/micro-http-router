const micro = require('micro');
const Router = require('./');

let router = new Router();

router
    .get('/', (req, res) => {
        return 'Hello, world';
    })
    .get('/:param', (req, res) => {
        return 'Your parameter is ' + req.params.param + '.';
    })
    .post('/', async (req, res) => {
        const body = await micro.json(req);
        return body;
    });

const server = micro((req, res) => router.route(req, res));
server.listen(3000);