'use strict';

const {send, createError} = require('micro');
const RadixRouter = require('radix-router');
const assert = require('assert');

const routerSymbol = Symbol();

const routeOptionsHelper = function (path, method, fn1, fn2) {
    let options = {
        path: path,
        method: method
    };

    assert(fn1, 'You must provide a valid function as the second parameter.');

    if (fn2) {
        options.before = fn1;
        options.handler = fn2;
    } else {
        options.handler = fn1;
    }

    return options;
};

module.exports = exports = class Router {
    constructor(options) {
        // Add new instance of RadixRouter
        this[routerSymbol] = new RadixRouter({strict: options && options.strict});

        this.debug = options && options.debug;
    }

    /**
     * Adds a route handler to the router.
     * @param {object} options The route information and handler
     */
    route(options) {
        assert(options, 'You must provide a valid route options object.');
        assert(options.path, 'You must provide a valid path.');
        assert(options.method, 'You must provide a valid route handler function.');
        assert(options.handler, 'You must provide a valid route handler function.');

        const existingRoute = this[routerSymbol].lookup(options.path);
        let route = {};
        if (existingRoute) {
            route = existingRoute;
        } else {
            route = {
                path: options.path,
                methods: {}
            };

            this[routerSymbol].insert(route);
        }

        route.methods[options.method.toLowerCase()] = {
            handler: options.handler
        };

        if (options.before) {
            assert(typeof options.before === 'function');

            route.methods[options.method.toLowerCase()].before = options.before;
        }

        return this;
    }

    /**
     * Deregisters a route with the specified path and method.
     * @param path The desired path to deregister.
     * @param method The desired method to deregister.
     */
    unroute(path, method) {
        assert(path, 'You must provide a valid path.');
        assert(method, 'You must provide a valid route handler function.');

        method = method.toLowerCase();

        const existingRoute = this[routerSymbol].lookup(path);
        let route = {};
        if (existingRoute) {
            route = existingRoute;
            this[routerSymbol].remove(path);
        } else {
            throw createError(400, `Route with path '${path}' not found to unroute.`);
        }

        console.log(route.methods);

        if (route.methods[method]) {
            delete route.methods[method];
        } else {
            throw createError(400, `Method ${method.toUpperCase()} "${path}" not found to unroute.`);
        }

        return this;
    }

    /**
     * Chains a HTTP "GET" route handler to the router object.
     * @param {String} path
     * @param {Function} fn1
     * @param {Function} fn2
     */
    get(path, fn1, fn2) {
        return this.route(routeOptionsHelper(path, 'GET', fn1, fn2));
    }

    /**
     * Chains a HTTP "POST" route handler to the router object.
     * @param {String} path
     * @param {Function} fn1
     * @param {Function} fn2
     */
    post(path, fn1, fn2) {
        return this.route(routeOptionsHelper(path, 'POST', fn1, fn2));
    }

    /**
     * Chains a HTTP "PUT" route handler to the router object.
     * @param {String} path
     * @param {Function} fn1
     * @param {Function} fn2
     */
    put(path, fn1, fn2) {
        return this.route(routeOptionsHelper(path, 'PUT', fn1, fn2));
    }

    /**
     * Chains a HTTP "DELETE" route handler to the router object.
     * @param {String} path
     * @param {Function} fn1
     * @param {Function} fn2
     */
    delete(path, fn1, fn2) {
        return this.route(routeOptionsHelper(path, 'DELETE', fn1, fn2));
    }

    /**
     * Chains a HTTP "OPTIONS" route handler to the router object.
     * @param {String} path
     * @param {Function} fn1
     * @param {Function} fn2
     */
    options(path, fn1, fn2) {
        return this.route(routeOptionsHelper(path, 'OPTIONS', fn1, fn2));
    }

    /**
     * Chains a HTTP "TRACE" route handler to the router object.
     * @param {String} path
     * @param {Function} fn1
     * @param {Function} fn2
     */
    trace(path, fn1, fn2) {
        return this.route(routeOptionsHelper(path, 'TRACE', fn1, fn2));
    }

    /**
     * Chains a HTTP "PATCH" route handler to the router object.
     * @param {String} path
     * @param {Function} fn1
     * @param {Function} fn2
     */
    patch(path, fn1, fn2) {
        return this.route(routeOptionsHelper(path, 'PATCH', fn1, fn2));
    }

    /**
     * Handles HTTP traffic according to the router.
     * @param {object} req http.incomingMessage
     * @param {object} res http.serverResponse
     */
    async handle(req, res) {
        const reqURL = new URL(req.url, 'http://localhost/');
        const route = this[routerSymbol].lookup(reqURL.pathname);

        if (route && req.method.toLowerCase() in route.methods) {
            try {
                const methodObj = route.methods[req.method.toLowerCase()];
                // Set the params if we have any
                if (route.params) req.params = route.params;

                // set query parameters as well
                req.searchParams = reqURL.searchParams;

                // Run the before function if one is configured
                if (methodObj.before) methodObj.before(req, res);

                // Finally, handle the result
                const result = await methodObj.handler(req, res);
                send(res, 200, result);
            } catch (e) {
                let data = null;
                if (this.debug)
                    data = `${e.name}: ${e.message}\n${e.stack}`;
                send(res, 500, data);
            }
        } else {
            throw createError(404, 'Route not found');
        }
    }
};
