import { serve } from 'https://deno.land/std@0.114.0/http/server.ts';
import * as handlers from './handlers.js';
import { errorResponse, NotFoundError, prettyPrint } from './helpers.js';

/** @type {Map<String, Function<Promise<Response>>>} */
const routes = new Map([
  ['/clear-days', handlers.clearDays],
  ['/cloudy-days', handlers.cloudyDays],
  ['/thunder-days', handlers.thunderDays],
  ['/lithologic-unit', handlers.lithologicUnit],
  ['/frost', handlers.frost],
  ['/nederbord', handlers.nederbord],
  ['/solskenstid', handlers.solskenstid],
  ['/vegetation', handlers.vegetation],
  ['/snotacke', handlers.snotacke],
  ['/arstidstart', handlers.arstidstart],
  ['/temperatur', handlers.temperatur],
  ['/globalstralning', handlers.globalstralning],
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

    if (!response.headers) {
      response.headers = new Headers();
    }

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
