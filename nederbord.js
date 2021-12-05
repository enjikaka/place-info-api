import { prettyPrint, validateSearchQuery, getData, findValue, checksum } from './helpers.js';

export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const wms = 'https://opendata-view.smhi.se/klim-stat_nederbord/wms';
  const responses = await Promise.all([
    'arsnederbord',
    'nederbord_jan',
    'nederbord_feb',
    'nederbord_mar',
    'nederbord_apr',
    'nederbord_maj',
    'nederbord_jun',
    'nederbord_jul',
    'nederbord_aug',
    'nederbord_sep',
    'nederbord_okt',
    'nederbord_nov',
    'nederbord_dec'
  ].map(layer => getData([lng, lat], {
    wms,
    layers: [layer]
  })));

  const data = responses.reduce((acc, curr, i) => ({
    ...acc,
    value: {
      ...acc.value,
      [i === 0 ? 'year' : i < 10 ? '--0' + i : '--' + i]: findValue(curr)
    }
  }), { unit: 'mm', value: {} });

  const body = JSON.stringify(data, null, prettyPrint(request) ? 4 : undefined);
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
