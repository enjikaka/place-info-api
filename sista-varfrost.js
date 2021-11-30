import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { errorResponse, geodeticToGrid, offset } from './helpers.js';

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

    const layer = 'GE.GeologicUnit.SGU.SurficialGeology_25K-100K.Lithology.Polygon';

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

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error('Could not fetch data');
    }

    return response.json();
}

function validateSearchQuery(url) {
    const lat = parseFloat(url.searchParams.get('lat'));

    if (Number.isNaN(lat)) {
        throw new ReferenceError('You did not provide a latitude value in the "lat" search parameter.');
    }

    const lng = parseFloat(url.searchParams.get('lng'));

    if (Number.isNaN(lng)) {
        throw new ReferenceError('You did not provide a longitude value in the "lat" search parameter.');
    }

    return { lng, lat };
}

async function handle(request) {
    const url = new URL(request.url);
    const { lng, lat } = validateSearchQuery(url);

    const data = await get([lng, lat]);
    const feature = data.features[0];

    return new Response(JSON.stringify({ data, feature }, null, prettyPrint ? 4 : undefined), {
        status: 200,
        headers: new Headers({
            'content-type': 'application/json'
        })
    });
}

function errorResponse(msg) {
    return new Response(msg, {
        status: 400,
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