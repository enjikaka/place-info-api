import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

import { handler as lithologicUnit } from './lithologic-unit.js';
import { handler as sistaVarfrost } from './sista-varfrost.js';

import { errorResponse, NotFoundError } from './helpers.js';

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function route(request) {
    if (new URLPattern('/lithologic-unit').test(request.url)) {
        return lithologicUnit(request);
    }

    if (new URLPattern('/sista-varfrost').test(request.url)) {
        return sistaVarfrost(request);
    }

    throw new NotFoundError('Not a valid path');
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
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
