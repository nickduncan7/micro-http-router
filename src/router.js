'use strict';

const { send } = require('micro');
const RadixRouter = require('radix-router');
const assert = require('assert');

const routerSymbol = Symbol();

module.exports = exports = class Router {
    constructor(options) {
        // Add new instance of RadixRouter
        this[routerSymbol] = new RadixRouter({ strict: options && options.strict });
    }

    /**
     * Adds a route handler to the router.
     * @param {object} options The route information and handler
     */
    route(options) {
        assert(options, 'You must provide a valid route options object.')
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
        }; 

        const method = {
            handler: options.handler
        }

        route.methods[options.method.toLowerCase()] = method;

        if (options.before) {
            assert(typeof options.before === 'function');

            route.methods[options.method.toLowerCase()].before = options.before;
        }

        return this;
    }

    /**
     * Chains a HTTP "GET" route handler to the router object.
     * @param {String} path 
     * @param {Function} handler 
     */
    get(path, handler) {
        return this.route({ path: path, method: 'GET', handler: handler});
    }

    /**
     * Chains a HTTP "POST" route handler to the router object.
     * @param {String} path 
     * @param {Function} handler 
     */
    post(path, handler) {
        return this.route({ path: path, method: 'POST', handler: handler});
    }

    /**
     * Chains a HTTP "PUT" route handler to the router object.
     * @param {String} path 
     * @param {Function} handler 
     */
    put(path, handler) {
        return this.route({ path: path, method: 'PUT', handler: handler});
    }

    /**
     * Chains a HTTP "DELETE" route handler to the router object.
     * @param {String} path 
     * @param {Function} handler 
     */
    delete(path, handler) {
        return this.route({ path: path, method: 'DELETE', handler: handler});
    }

    /**
     * Chains a HTTP "OPTIONS" route handler to the router object.
     * @param {String} path 
     * @param {Function} handler 
     */
    options(path, handler) {
        return this.route({ path: path, method: 'OPTIONS', handler: handler});
    }

    /**
     * Chains a HTTP "TRACE" route handler to the router object.
     * @param {String} path 
     * @param {Function} handler 
     */
    trace(path, handler) {
        return this.route({ path: path, method: 'TRACE', handler: handler});
    }

    /**
     * Chains a HTTP "PATCH" route handler to the router object.
     * @param {String} path 
     * @param {Function} handler 
     */
    patch(path, handler) {
        return this.route({ path: path, method: 'PATCH', handler: handler});
    }

    /**
     * Handles HTTP traffic according to the router.
     * @param {object} req http.incomingMessage
     * @param {object} res http.serverResponse
     */
    async handle(req, res) {
        const route = this[routerSymbol].lookup(req.url);

        if (route && req.method.toLowerCase() in route.methods) {
            try {
                const methodObj = route.methods[req.method.toLowerCase()];
                // Set the params if we have any
                if (route.params) req.params = route.params;

                // Run the before function if one is configured
                if (methodObj.before) methodObj.before(req, res);

                // Finally, handle the result
                const result = await methodObj.handler(req, res);
                send(res, 200, result);
                return;
            } catch (e) {
                send(res, 500);
                return;
            }
        } else {
            send(res, 404, 'Route not found.');
            return;
        }
    }
};