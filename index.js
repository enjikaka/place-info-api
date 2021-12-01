import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

/**
 * @param {Request} request 
 */
async function route(request) {
    const { pathname } = new URL(request.url);

    try {
        const { handler } = await import(`.${pathname}.js`);

        return handler(request);
    } catch (e) {
        throw new Error('Not a valid path');
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
        response = errorResponse(e.message);
    }

    return response;
}

serve(handle);
