import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

import { handler as lithologicUnit } from './lithologic-unit.js';
import { handler as sistaVarfrost } from './sista-varfrost.js';
import { handler as forstaHostfrost } from './forsta-hostfrost.js';
import { handler as nederbord } from './nederbord.js';
import { handler as solskenstid } from './solskenstid.js';
import { handler as vegetation } from './vegetation.js';

import { errorResponse, NotFoundError } from './helpers.js';

/** @type {Map<String, Function<Promise<Response>>>} */
const routes = new Map([
  ['/lithologic-unit', lithologicUnit],
  ['/sista-varfrost', sistaVarfrost],
  ['/forsta-hostfrost', forstaHostfrost],
  ['/nederbord', nederbord],
  ['/solskenstid', solskenstid],
  ['/vegetation', vegetation]
]);

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function router(request) {
  const url = new URL(request.url);

  for (const [pathname, handler] of routes) {
    if (new URLPattern({ pathname }).test(url)) {
      return handler(request);
    }
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
    response = await router(request);

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Request-Method', 'GET');
  } catch (e) {
    console.error(e);
    const status = e instanceof NotFoundError ? 404 : 400;

    response = errorResponse(e.message, status);
  }

  return response;
}

serve(handle);
