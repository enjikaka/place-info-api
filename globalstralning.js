import { validateSearchQuery, cachedResponse, getMetaData, getData, findValue, shortMonthToNum } from './helpers.js';

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const wms = 'https://opendata-view.smhi.se/klim-stat_globalstralning/wms';
  const responses = await Promise.all([
    'globalstralning',
    'globalstralning_feb',
    'globalstralning_apr',
    'globalstralning_jun',
    'globalstralning_aug',
    'globalstralning_okt',
    'globalstralning_dec'
  ].map(layer => getData([lng, lat], {
    wms,
    layers: [layer]
  })));

  const cleanValue = v => v.includes(' ') ? v.split(' ')[0] : v;

  const data = responses.reduce((acc, curr, i) => ({
    ...acc,
    value: {
      ...acc.value,
      [i === 0 ? 'year' : '--' + shortMonthToNum(curr.legendGraphic.Legend[0].layerName.split('_')[1])]: cleanValue(findValue(curr))
    }
  }), { unit: 'kWh/m²', value: {} });

  const metadata = await getMetaData(wms);

  data.metadata = metadata;

  return cachedResponse(data, request);
}
