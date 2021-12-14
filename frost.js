import { prettyPrint, validateSearchQuery, getData, findValue, shortMonthToNum, checksum } from './helpers.js';

async function getHostfrost(request) {
  function fixValue(value) {
    const [day, monthString] = value.split(' ');

    const monthNumber = shortMonthToNum(monthString);

    return `--${monthNumber}-${day}`;
  }

  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_is/forsta_hostfrost/wms',
    layers: ['klim-stat_is:forsta_hostfrost_yta']
  });

  const rawValue = findValue(data);

  return fixValue(rawValue);
}

async function getVarfrost(request) {
  function fixValue(value) {
    const [fromDay, toDay] = value.split('-').map(n => parseInt(n, 10));

    const [, monthString] = value.split(' ');
    const monthNumber = shortMonthToNum(monthString);

    return `--${monthNumber}-${fromDay}/--${monthNumber}-${toDay}`;
  }

  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const data = await getData([lng, lat], {
    wms: 'https://opendata-view.smhi.se/klim-stat_is/sista_varfrost/wms',
    layers: ['klim-stat_is:sista_varfrost_yta']
  });

  const rawValue = findValue(data);

  return fixValue(rawValue);
}

export async function handler(request) {
  const _hostfrost = getHostfrost(request);
  const _varfrost = getVarfrost(request);

  const hostfrost = await _hostfrost;
  const varfrost = await _varfrost;

  const body = JSON.stringify({ hostfrost, varfrost }, null, prettyPrint(request) ? 4 : undefined);
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
