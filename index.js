function geodeticToGrid(latitude, longitude) {
  const axis = 6378137.0; // GRS 80.
  const flattening = 1.0 / 298.257222101; // GRS 80.
  const centralMeridian = 15.00;
  const latOfOrigin = 0.0;
  const scale = 0.9996;
  const falseNorthing = 0.0;
  const falseEasting = 500000.0;

  const xy = new Array(2);

  if (centralMeridian == null) {
    return xy;
  }

  // Prepare ellipsoid-based stuff.
  const e2 = flattening * (2.0 - flattening);
  const n = flattening / (2.0 - flattening);
  const aRoof = axis / (1.0 + n) * (1.0 + n * n / 4.0 + n * n * n * n / 64.0);
  const A = e2;
  const B = (5.0 * e2 * e2 - e2 * e2 * e2) / 6.0;
  const C = (104.0 * e2 * e2 * e2 - 45.0 * e2 * e2 * e2 * e2) / 120.0;
  const D = (1237.0 * e2 * e2 * e2 * e2) / 1260.0;
  const beta1 = n / 2.0 - 2.0 * n * n / 3.0 + 5.0 * n * n * n / 16.0 + 41.0 * n * n * n * n / 180.0;
  const beta2 = 13.0 * n * n / 48.0 - 3.0 * n * n * n / 5.0 + 557.0 * n * n * n * n / 1440.0;
  const beta3 = 61.0 * n * n * n / 240.0 - 103.0 * n * n * n * n / 140.0;
  const beta4 = 49561.0 * n * n * n * n / 161280.0;

  // Convert.
  const degToRad = Math.PI / 180.0;
  const phi = latitude * degToRad;
  const lambda = longitude * degToRad;
  const lambdaZero = centralMeridian * degToRad;

  const phiStar = phi - Math.sin(phi) * Math.cos(phi) * (A +
    B * Math.pow(Math.sin(phi), 2) +
    C * Math.pow(Math.sin(phi), 4) +
    D * Math.pow(Math.sin(phi), 6));
    const deltaLambda = lambda - lambdaZero;
  const xiPrim = Math.atan(Math.tan(phiStar) / Math.cos(deltaLambda));
  const etaPrim = Math.atanh(Math.cos(phiStar) * Math.sin(deltaLambda));
  const x = scale * aRoof * (xiPrim +
    beta1 * Math.sin(2.0 * xiPrim) * Math.cosh(2.0 * etaPrim) +
    beta2 * Math.sin(4.0 * xiPrim) * Math.cosh(4.0 * etaPrim) +
    beta3 * Math.sin(6.0 * xiPrim) * Math.cosh(6.0 * etaPrim) +
    beta4 * Math.sin(8.0 * xiPrim) * Math.cosh(8.0 * etaPrim)) +
    falseNorthing;
  const y = scale * aRoof * (etaPrim +
    beta1 * Math.cos(2.0 * xiPrim) * Math.sinh(2.0 * etaPrim) +
    beta2 * Math.cos(4.0 * xiPrim) * Math.sinh(4.0 * etaPrim) +
    beta3 * Math.cos(6.0 * xiPrim) * Math.sinh(6.0 * etaPrim) +
    beta4 * Math.cos(8.0 * xiPrim) * Math.sinh(8.0 * etaPrim)) +
    falseEasting;

  xy[0] = Math.round(x * 1000.0) / 1000.0;
  xy[1] = Math.round(y * 1000.0) / 1000.0;

  return xy;
}

function offset([long, lat], dn = 10, de = 10) {
  // Earth’s radius, sphere.
  const R = 6378137

  // Coordinate offsets in radians
  const dLat = dn / R
  const dLon = de / (R * Math.cos(Math.PI * lat / 180))

  // OffsetPosition, decimal degrees
  const latO = lat + dLat * 180 / Math.PI;
  const lonO = long + dLon * 180 / Math.PI;

  return [lonO, latO];
}

/**
 * @param {number[]} coord
 * @param {AthmosphereType} type
 */
async function get([lng, lat]) {
  const url = new URL('https://maps3.sgu.se/geoserver/inspire/ows');

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

function validateSearchQuery (url) {
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

async function handle (event) {
  const url = new URL(event.request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await get([lng, lat]);
  const feature = data.features[0];

  const responseData = {
    [feature.properties.geologicUnitType]: feature.properties.description.toLowerCase()
  };

  const prettyPrint = event.request.headers.get('origin') === null;

  return new Response(JSON.stringify(responseData, null, prettyPrint ? 4 : undefined), {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json'
    })
  });
}

function errorResponse (msg) {
  return new Response(msg, {
    status: 400,
  });
}

function nextHour () {
  const hh = new Date().getUTCHours();

  return hh < 24 ? hh + 1 : 0;
}

addEventListener('fetch', async event => {
  let response;

  try {
    response = await handle(event);

    // TODO: Set better cache headers when I have figured out how often CAMS updates these responses...
    const d = new Date();

    d.setUTCHours(nextHour());
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);

    response.headers.set('Expires', d.toUTCString());

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Request-Method', 'GET');
  } catch (e) {
    response = errorResponse(e.message);
  }

  event.respondWith(response);
});
