import { cachedResponse, getMetaData, getCoordinates, getData, findValue } from './helpers.js';

const wms = 'https://opendata-view.smhi.se/klim-stat_moln/klara_dagar/wms';

/**
 * @param {import("./helpers.js").Coordinates} coords
 */
export async function getClearDays(coords) {
  const data = await getData(coords, {
    wms,
    layers: ['klara_dagar']
  });

  const [rawValue, rawUnit] = findValue(data).split(' ');

  const unit = rawUnit === 'dygn' ? 'd' : undefined; // Convert "dygn" to "acceptable" SI-input "d"
  const value = rawValue.replace('-', '–'); // Convert dash to en-dash to emphasize range.

  return { value, unit };
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [clearDays, metadata] = await Promise.all([
    getClearDays(coords, 'feb'),
    getMetaData(wms)
  ]);

  return cachedResponse({
    unit: clearDays.unit,
    value: clearDays.value,
    metadata
  }, request);
}
