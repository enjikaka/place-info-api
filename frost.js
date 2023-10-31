import { cachedResponse, getMetaData, getCoordinates, getData, findValue, shortMonthToNum } from './helpers.js';

/**
 *
 * @param {Coordinates} coords
 * @returns
 */
export async function getFirstAutumnFrostDate(coords) {
  const data = await getData(coords, {
    wms: 'https://opendata-view.smhi.se/klim-stat_is/forsta_hostfrost/wms',
    layers: ['klim-stat_is:forsta_hostfrost_yta']
  });

  const rawValue = findValue(data); // Example: "1 okt"
  const [day, monthString] = rawValue.split(' ');
  const monthNumber = shortMonthToNum(monthString);

  return `--${monthNumber}-${day}`;
}

/**
 *
 * @param {Coordinates} coords
 * @returns
 */
export async function getLastSpringFrostDate(coords) {
  const data = await getData(coords, {
    wms: 'https://opendata-view.smhi.se/klim-stat_is/sista_varfrost/wms',
    layers: ['klim-stat_is:sista_varfrost_yta']
  });

  const rawValue = findValue(data); // Example: "1-15 maj"
  const [days, monthString] = rawValue.split(' ');
  const [fromDay, toDay] = days.split('-').map(n => parseInt(n, 10));
  const monthNumber = shortMonthToNum(monthString);

  return `--${monthNumber}-${fromDay}/--${monthNumber}-${toDay}`;
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [höstfrost, vårfrost, metadata] = await Promise.all([
    getFirstAutumnFrostDate(coords),
    getLastSpringFrostDate(coords),
    getMetaData('https://opendata-view.smhi.se/klim-stat_is/sista_varfrost/wms')
  ]);

  return cachedResponse({
    value: {
      höstfrost,
      vårfrost
    },
    metadata
  }, request);
}
