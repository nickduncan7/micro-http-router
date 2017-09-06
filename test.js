const { test } = require('ava');
const micro = require('micro');
const listen = require('test-listen');
const request = require('request-promise');
const Router = require('./');

test('simple request handled successfully', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/', (req, res) => {
        micro.send(res, 200, {
            success: true
        });
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    const response = await request(url);

    // Perform the test check
    t.deepEqual(JSON.parse(response).success, true);

    // Close the service
    service.close();
});

test('error 404 when no route found', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/foo', (req, res) => {
        micro.send(res, 200, {
            success: true
        });
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);

    // Perform the test check
    try {
        const response = await request(url);
    } catch (e) {
        if (e && e.statusCode && e.statusCode === 404) {
            t.pass();
        } else {
            t.fail();
        }
    }

    // Close the service
    service.close();
});

test('correct route selected with multiple routes defines', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/foo', (req, res) => {
        micro.send(res, 200, 'foo');
    });
    router.get('/bar', (req, res) => {
        micro.send(res, 200, 'bar');
    });
    router.get('/baz', (req, res) => {
        micro.send(res, 200, 'baz');
    });
    router.get('/qux', (req, res) => {
        micro.send(res, 200, 'qux');
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    const response = await request(`${ url }/bar`);

    // Perform the test check
    t.notDeepEqual(response, 'foo');
    t.notDeepEqual(response, 'baz');
    t.notDeepEqual(response, 'qux');
    t.deepEqual(response, 'bar');

    // Close the service
    service.close();
});

test('correct method selected for routes with same path', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/', (req, res) => {
        micro.send(res, 200, 'foo');
    });
    router.post('/', (req, res) => {
        micro.send(res, 200, 'bar');
    });
    router.put('/', (req, res) => {
        micro.send(res, 200, 'baz');
    });
    router.delete('/', (req, res) => {
        micro.send(res, 200, 'qux');
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    const response = await request({
        method: 'POST',
        uri: url
    });

    // Perform the test check
    t.notDeepEqual(response, 'foo');
    t.notDeepEqual(response, 'baz');
    t.notDeepEqual(response, 'qux');
    t.deepEqual(response, 'bar');

    // Close the service
    service.close();
});

test('route handlers can be overridden correctly', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/', (req, res) => {
        micro.send(res, 200, 'foo');
    });
    router.get('/', (req, res) => {
        micro.send(res, 200, 'bar');
    });
    router.get('/', (req, res) => {
        micro.send(res, 200, 'baz');
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    const response = await request(url);

    // Perform the test check
    t.notDeepEqual(response, 'foo');
    t.notDeepEqual(response, 'bar');
    t.deepEqual(response, 'baz');

    // Close the service
    service.close();
});