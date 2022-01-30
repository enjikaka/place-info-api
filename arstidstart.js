import { cachedResponse, getMetaData, validateSearchQuery, getData, findValue, fixValueDateRange } from './helpers.js';

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const wms = 'https://opendata-view.smhi.se/klim-stat_arstidstart/wms';
  const layers = [
    'klim-stat_arstidstart:arstidstart_vinter_yta',
    'klim-stat_arstidstart:arstidstart_var_yta',
    'klim-stat_arstidstart:arstidstart_sommar_yta',
    'klim-stat_arstidstart:arstidstart_host_yta',
  ];
  const responses = await Promise.all(layers.map(layer => getData([lng, lat], {
    wms,
    layers: [layer]
  })));

  const data = responses.reduce((acc, curr, i) => ({
    ...acc,
    value: {
      ...acc.value,
      [layers[i].split('klim-stat_arstidstart:arstidstart_')[1].split('_')[0]]: fixValueDateRange(findValue(curr))
    }
  }), { value: {} });

  data.metadata = await getMetaData(wms);

  return cachedResponse(data, request);
}
