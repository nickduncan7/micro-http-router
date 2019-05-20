const { test } = require('ava');
const micro = require('micro');
const listen = require('test-listen');
const request = require('request-promise');
const sleep = require('sleep-promise');
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

test('all HTTP methods are successful', async t => {
    // Create new instance of micro-http-router
    const router = new Router();
    
    const methods = [
        'get',
        'post',
        'put',
        'delete',
        'options',
        'trace',
        'patch'
    ];

    router.get('/', (req, res) => {
        micro.send(res, 200, 'get');
    });
    router.post('/', (req, res) => {
        micro.send(res, 200, 'post');
    });
    router.put('/', (req, res) => {
        micro.send(res, 200, 'put');
    });
    router.delete('/', (req, res) => {
        micro.send(res, 200, 'delete');
    });
    router.options('/', (req, res) => {
        micro.send(res, 200, 'options');
    });
    router.trace('/', (req, res) => {
        micro.send(res, 200, 'trace');
    });
    router.patch('/', (req, res) => {
        micro.send(res, 200, 'patch');
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);

    for (const method of methods) {
        const response = await request({
            uri: url,
            method: method
        });

        // Perform the test check
        t.deepEqual(response, method);

        // wait 50 ms to allow requests to complete
        await sleep(50);
    }
    
    // Close the service
    service.close();
});

test('strict mode works correctly', async t => {
    // Create new instance of micro-http-router
    const router = new Router({strict: true});

    // Configure the routes
    router.get('/strict', (req, res) => {
        micro.send(res, 200, {
            success: true
        });
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    let response = await request(`${ url }/strict`);

    // Perform the test check
    t.deepEqual(JSON.parse(response).success, true);

    try {
        response = await request(`${ url }/strict/`);
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

test('error in handler logic handled successfully', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/', (req, res) => {
        throw new Error();
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);

    // Perform the test check
    // In try/catch block since the request promise will fail
    try {
        const response = await request(url);
    } catch (e) {
        if (e && e.statusCode && e.statusCode === 500) {
            t.pass();
        } else {
            t.fail();
        }
    }

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

test('correct route selected with multiple routes defined', async t => {
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

test('request parameters are mapped correctly', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the route
    router.get('/:zero/:one/:two/:three', (req, res) => {
        micro.send(res, 200, [
            req.params.zero,
            req.params.one,
            req.params.two,
            req.params.three
        ]);
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request
    const url = await listen(service);

    const response = await request(`${ url }/zero/one/two/three`);
    t.deepEqual(JSON.parse(response)[0], 'zero');
    t.deepEqual(JSON.parse(response)[1], 'one');
    t.deepEqual(JSON.parse(response)[2], 'two');
    t.deepEqual(JSON.parse(response)[3], 'three');
    
    // Close the service
    service.close();
});

test('request parameters load test', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the route
    router.get('/:number', (req, res) => {
        micro.send(res, 200, req.params.number);
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/:number'
    const url = await listen(service);

    for (let i = 0; i < 100; i++) {
        const response = await request(`${ url }/${ i }`);
        t.deepEqual(response, i.toString());
    }
    
    // Close the service
    service.close();
});

test('before request works correctly', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.route({
        path: '/',
        method: 'GET',
        before: (req, res) => {
            req.testdata = 'foobar';
        },
        handler: (req, res) => {
            return req.testdata;
        }
    });    

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    const response = await request(url);

    // Perform the test check
    t.deepEqual(response, 'foobar');

    // Close the service
    service.close();
});

test('before request using http method shorthand works correctly', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    const beforeHandler = (req, res) => {
        req.testdata = 'foobar';
    }

    // Configure the routes
    router.get('/', beforeHandler, (req, res) => {
        return req.testdata;
    });    

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    const response = await request(url);

    // Perform the test check
    t.deepEqual(response, 'foobar');

    // Close the service
    service.close();
});

test('debug error logging is successful', async t => {
    // Create new instance of micro-http-router
    const router = new Router({
        debug: true
    });
    const errorMessage = 'test error';

    // Configure the routes
    router.get('/', (req, res) => {
        throw new Error(errorMessage);
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);

    try {
        await request(url);
    } catch (e) {
        if (e && e.statusCode && e.statusCode === 500 && e.message.indexOf(errorMessage) !== -1) {
            t.pass();
        } else {
            t.fail();
        }
    }

    // Close the service
    service.close();
});

test('route with query params works', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/', (req, res) => {
        micro.send(res, 200, {
            hello: req.searchParams.get('hello')
        });
    });

    // Create the service
    const service = micro((req, res) => router.handle(req, res));

    // Listen to the service and make the request to route '/'
    const url = await listen(service);
    const response = await request(`${url}/?hello=world` );

    // Perform the test check
    t.deepEqual(JSON.parse(response).hello, 'world');

    // Close the service
    service.close();
});

test('route can be deregistered successfully', async t => {
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
    await request(url);

    router.unroute('/',  'GET');

    // Perform the test check - route should no longer be registered
    try {
        await request(url);
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

test('invalid route cannot be deregistered', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/', (req, res) => {
        micro.send(res, 200, {
            success: true
        });
    });

    // Perform the test check - unroute should fail
    try {
        router.unroute('/foo',  'GET');
    } catch (e) {
        t.pass();
    }
});

test('invalid route method cannot be deregistered', async t => {
    // Create new instance of micro-http-router
    const router = new Router();

    // Configure the routes
    router.get('/', (req, res) => {
        micro.send(res, 200, {
            success: true
        });
    });

    // Perform the test check - unroute should fail
    try {
        router.unroute('/',  'POST');
    } catch (e) {
        t.pass();
    }
});

test('unrouteAll method deregisters all routes successfully', async t => {
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

    // Perform test check - router should have 4 routes
    if (Object.keys(router.routes).length === 4) {

        router.unrouteAll();
        // Router should now have zero routes
        if (Object.keys(router.routes).length === 0) {
            t.pass();
        } else {
            t.fail();
        }
    } else {
        t.fail();
    }
});