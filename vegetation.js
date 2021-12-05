import { prettyPrint, validateSearchQuery, getData, findValue, checksum } from './helpers.js';

export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_vegatation/vegetationsperiodens_langd/wms',
    layers: ['vegetationsperiodens_langd_yta']
  });

  const rawValue = findValue(data);
  const [value, unit] = rawValue.split(' ');

  const body = JSON.stringify({ value, unit }, null, prettyPrint(request) ? 4 : undefined);
  const etag = await checksum(body);

  if (etag === request.headers.get('if-none-match')) {
    return new Response(null, { status: 304 });
  }

  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600, immutable',
      'etag': etag
    })
  });
}
