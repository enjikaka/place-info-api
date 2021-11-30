import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { prettyPrint, validateSearchQuery, errorResponse, geodeticToGrid, offset } from './helpers.js';

/**
 * @param {number[]} coord
 * @param {AthmosphereType} type
 */
async function get([lng, lat]) {
    const url = new URL('https://opendata-view.smhi.se/klim-stat_is/sista_varfrost/wms');

    const rad = 50;

    const [longNW, latNW] = offset([lng, lat], -(rad), -(rad));
    const [longSE, latSE] = offset([lng, lat], rad, rad);

    const [xNW, yNW] = geodeticToGrid(latNW, longNW);
    const [xSE, ySE] = geodeticToGrid(latSE, longSE);

    const bbox = [xNW, yNW, xSE, ySE].join(',');

    url.searchParams.set('BBOX', bbox);

    const width = 101;
    const height = 101;
    const x = 50;
    const y = 50;

    const layer = 'klim-stat_is:sista_varfrost_yta';

    url.searchParams.set('service', 'WMS');
    url.searchParams.set('version', '1.3.0');
    url.searchParams.set('request', 'GetFeatureInfo');

    url.searchParams.set('layers', layer);
    url.searchParams.set('query_layers', layer);
    url.searchParams.set('info_format', 'application/json');

    url.searchParams.set('transparent', true);
    url.searchParams.set('crs', 'EPSG:3006');
    url.searchParams.set('width', width);
    url.searchParams.set('height', height);
    url.searchParams.set('x', x);
    url.searchParams.set('y', y);

    console.log(url.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error('Could not fetch data');
    }

    return response.json();
}

async function handle(request) {
    const url = new URL(request.url);
    const { lng, lat } = validateSearchQuery(url);

    const data = await get([lng, lat]);
    const feature = data.features[0];

    return new Response(JSON.stringify({ data, feature }, null, prettyPrint(request) ? 4 : undefined), {
        status: 200,
        headers: new Headers({
            'content-type': 'application/json'
        })
    });
}

serve(async request => {
    let response;

    try {
        response = await handle(request);

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Request-Method', 'GET');
    } catch (e) {
        response = errorResponse(e.message);
    }

    return response;
});
