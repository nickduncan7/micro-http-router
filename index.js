'use strict';

const { send } = require('micro');
const UrlPattern = require('url-pattern');
const methods = require('./src/methods');

const s_addRoute = Symbol();

module.exports = exports = class Router {
    constructor() {
        this.routes = [];

        this[s_addRoute] = function (route, method, handler, ...args) {
            if (!route) throw new Error('\'' + route + '\' is not a valid route.');
            if (!handler) throw new Error('You must provide a valid route handler function.');

            const pattern = new UrlPattern(route);
            this.routes.push({
                route: route,
                method: method,
                pattern: pattern,
                handler: handler
            });
        }
    }

    /**
     * Chains a HTTP "GET" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    get(route, handler) {
        this[s_addRoute](route, methods.get, handler);
        return this;
    }

    /**
     * Chains a HTTP "HEAD" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    head(route, handler) {
        this[s_addRoute](route, methods.head, handler);
        return this;
    }

    /**
     * Chains a HTTP "POST" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    post(route, handler) {
        this[s_addRoute](route, methods.post, handler);
        return this;
    }

    /**
     * Chains a HTTP "PUT" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    put(route, handler) {
        this[s_addRoute](route, methods.put, handler);
        return this;
    }

    /**
     * Chains a HTTP "DELETE" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    delete(route, handler) {
        this[s_addRoute](route, methods.delete, handler);
        return this;
    }

    /**
     * Chains a HTTP "CONNECT" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    connect(route, handler) {
        this[s_addRoute](route, methods.connect, handler);
        return this;
    }

    /**
     * Chains a HTTP "OPTIONS" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    options(route, handler) {
        this[s_addRoute](route, methods.options, handler);
        return this;
    }

    /**
     * Chains a HTTP "TRACE" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    trace(route, handler) {
        this[s_addRoute](route, methods.trace, handler);
        return this;
    }

    /**
     * Chains a HTTP "PATCH" route handler to the router object.
     * @param {String} route 
     * @param {Function} handler 
     */
    patch(route, handler) {
        this[s_addRoute](route, methods.patch, handler);
        return this;
    }

    /**
     * Routes HTTP traffic according to the route handler chain.
     * @param {object} req http.incomingMessage
     * @param {object} res http.serverResponse
     */
    async route(req, res) {
        const validRoutes = this.routes.filter((route) => { return route.method.toUpperCase() === req.method.toUpperCase() });

        if (validRoutes.length === 0) {
            send(res, 405, 'Method not allowed.');
            return;
        }

        let routeExists = false;
        let route = {};

        for (let i = 0; i < validRoutes.length; i++) {
            const params = validRoutes[i].pattern.match(req.url);

            // If params is truthy, we have a match.
            // This also doubles as our route params object.
            if (params) {
                routeExists = true;
                req.params = params;
                route = validRoutes[i];
                break;
            } 
        }

        if (routeExists) {
            try {
                // Finally, handle the result
                let result = await route.handler(req, res);
                send(res, 200, result);
                return;
            } catch (e) {
                console.log(e);
                send(res, 500);
                return;
            }
        } else {
            send(res, 404, 'Route not found.');
            return;
        }
    }
};