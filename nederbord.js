import { getMetaData, cachedResponse, validateSearchQuery, getData, findValue } from './helpers.js';

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
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

  data.metadata = await getMetaData(wms);

  return cachedResponse(data, request);
}
