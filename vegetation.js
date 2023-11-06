import { getMetaData, getCoordinates, getData, findValue, cachedResponse } from './helpers.js';

const wms = 'https://opendata-view.smhi.se/klim-stat_vegatation/vegetationsperiodens_langd/wms';

/**
 *
 * @param {Coordinates} coords
 */
export async function getVegetationPeriodLength(coords) {
  const data = await getData(coords, {
    wms,
    layers: ['vegetationsperiodens_langd_yta']
  });

  const rawValue = findValue(data);
  const [value, unit] = rawValue.split(' ');

  return [value, unit];
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [[value, unit], metadata] = await Promise.all([
    getVegetationPeriodLength(coords),
    getMetaData(wms)
  ]);

  const responseData = { value, unit, metadata };

  return cachedResponse(responseData, request);
}
