const micro = require('micro');
const Router = require('../');

// Initialize the router
const router = new Router({
    debug: true
});

router.get('/', (req, res) => {
    throw new Error('A bad thing happened, sorry.');
});

// Start micro and listen
const server = micro((req, res) => router.handle(req, res));
const port = 3000;
server.listen(port);
console.log(`micro is listening on port: ${ port }`);