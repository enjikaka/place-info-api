import { getMetaData, validateSearchQuery, getData, findValue, cachedResponse } from './helpers.js';

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const url = new URL(request.url);
  const { lng, lat } = validateSearchQuery(url);

  const wms = 'https://opendata-view.smhi.se/klim-stat_vegatation/vegetationsperiodens_langd/wms';
  const data = await getData([lng, lat], {
    wms,
    layers: ['vegetationsperiodens_langd_yta']
  });

  const rawValue = findValue(data);
  const [value, unit] = rawValue.split(' ');

  const responseData = { value, unit };

  responseData.metadata = await getMetaData(wms);

  return cachedResponse(responseData, request);
}
