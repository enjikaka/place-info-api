import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { errorResponse, NotFoundError } from './helpers.js';

/**
 * @param {Request} request
 */
async function route(request) {
    const { pathname } = new URL(request.url);

    try {
        const { handler } = await import(`.${pathname}.js`);

        return handler(request);
    } catch (e) {
        throw new NotFoundError('Not a valid path');
    }
}

/**
 * @param {Request} request
 */
async function handle(request) {
    let response;

    try {
        response = await route(request);

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Request-Method', 'GET');
    } catch (e) {
        const status = e instanceof NotFoundError ? 404 : 400;

        response = errorResponse(e.message, status);
    }

    return response;
}

serve(handle);
