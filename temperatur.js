import { getCoordinates, getData, findValue, cachedResponse, getMetaData } from './helpers.js';

const wms = 'https://opendata-view.smhi.se/klim-stat_temperatur/wms';

/**
 *
 * @param {Coordinates} coords
 * @param {'dygnsmintemp'|'dygnsmaxtemp'|'medeltemp'} prefix
 * @returns
 */
export async function getTempData(coords, prefix) {
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

  const responses = await Promise.all(layers.map(layer => getData(coords, {
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

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [medelmin, medelmax, medeltemp, metadata] = await Promise.all([
    getTempData(coords, 'dygnsmintemp'),
    getTempData(coords, 'dygnsmaxtemp'),
    getTempData(coords, 'medeltemp'),
    getMetaData(wms)
  ]);

  const response = {
    value: {
      medelmin,
      medelmax,
      medeltemp
    },
    unit: '°C',
    metadata
  };

  return cachedResponse(response, request);
}
