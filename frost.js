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

  const rawValue = findValue(data).trim(); // Example: "1 okt"
  const [day, monthString] = rawValue.split(' ');
  const monthNumber = shortMonthToNum(monthString);
  const dayLeadingZero = day < 10 ? '0' + day : day;

  return `--${monthNumber}-${dayLeadingZero}`;
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

  const rawValue = findValue(data).trim(); // Example: "1-15 maj"

  switch (rawValue) {
    case '1-15 april':
      return `--04-01/--04-15`;
    case '15 april - 1 maj':
      return `--04-15/--05-01`;
    case '1-15 maj':
      return `--05-01/--05-15`;
    case '15 maj - 1 juni':
      return `--05-15/--06-01`;
    case '1-15 juni':
      return `--06-01/--06-15`;
    case '> 15 juni eller senare':
      return '--06-15';
    default:
      return undefined;
  }
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
