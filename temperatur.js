import { prettyPrint, validateSearchQuery, getData, findValue, checksum, fixValueDateRange, shortMonthToNum } from './helpers.js';

async function getTempData(request, prefix) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const wms = 'https://opendata-view.smhi.se/klim-stat_temperatur/wms';
  const layers = [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dec'
  ].map(m => `${prefix}_${m}`);

  const responses = await Promise.all(layers.map(layer => getData([lng, lat], {
    wms,
    layers: [layer]
  })));

  const data = responses.reduce((acc, curr, i) => ({
    ...acc,
    value: {
      ...acc.value,
      ['--' + (i + 1)]: findValue(curr)
    }
  }), { value: {} });

  return data.value;
}

export async function handler(request) {
  const _medelmin = getTempData(request, 'dygnsmintemp');
  const _medelmax = getTempData(request, 'dygnsmaxtemp');
  const _medeltemp = getTempData(request, 'medeltemp');

  const medelmin = await _medelmin;
  const medelmax = await _medelmax;
  const medeltemp = await _medeltemp;

  const body = JSON.stringify({
    medelmin,
    medelmax,
    medeltemp
  }, null, prettyPrint(request) ? 4 : undefined);
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
