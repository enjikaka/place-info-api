import { cachedResponse, getMetaData, getCoordinates, getData, findValue } from './helpers.js';

const wms = 'https://opendata-view.smhi.se/klim-stat_aska/askdygn/wms';

/**
 * @param {import("./helpers.js").Coordinates} coords
 */
export async function getThunderDays(coords) {
  const data = await getData(coords, {
    wms,
    layers: ['askdygn']
  });

  const rawValue = findValue(data);

  const value = rawValue.replace('-', '–'); // Convert dash to en-dash to emphasize range.

  return { value, unit: 'd' };
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [clearDays, metadata] = await Promise.all([
    getThunderDays(coords),
    getMetaData(wms)
  ]);

  return cachedResponse({
    unit: clearDays.unit,
    value: clearDays.value,
    metadata
  }, request);
}
