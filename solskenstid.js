import { getMetaData, cachedResponse, getCoordinates, cleanValue, getData, findValue, shortMonthToNum } from './helpers.js';

const wms = 'https://opendata-view.smhi.se/klim-stat_solskenstid/wms';

/**
 *
 * @param {import("./helpers.js").Coordinates} coords
 * @param {'feb'|'apr'|'jun'|'aug'|'okt'|'dec'|'year'} period
 */
export async function getSunshineHours(coords, period) {
  const layerName = period !== 'year' ? 'solskenstid_' + period : 'solskenstid';

  const data = await getData(coords, {
    wms,
    layers: [layerName]
  });

  const key = period === 'year' ? 'year' : '--' + shortMonthToNum(data.legendGraphic.Legend[0].layerName.split('_')[1]);

  return {
    [key]: cleanValue(findValue(data))
  };
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordinates(request);

  const [feb, apr, jun, aug, okt, dec, year, metadata] = await Promise.all([
    getSunshineHours(coords, 'feb'),
    getSunshineHours(coords, 'apr'),
    getSunshineHours(coords, 'jun'),
    getSunshineHours(coords, 'aug'),
    getSunshineHours(coords, 'okt'),
    getSunshineHours(coords, 'dec'),
    getSunshineHours(coords, 'year'),
    getMetaData(wms)
  ]);

  const value = Object.assign(feb, apr, jun, aug, okt, dec, year);

  return cachedResponse({
    unit: 'h',
    value,
    metadata
  }, request);
}
