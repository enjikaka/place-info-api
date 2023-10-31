import { getCoordsFromRequest, cachedResponse, getMetaData, getData, findValue, shortMonthToNum } from './helpers.js';

const wms = 'https://opendata-view.smhi.se/klim-stat_globalstralning/wms';

/**
 *
 * @param {Coordinates} coords
 * @param {'feb'|'apr'|'jun'|'aug'|'okt'|'dec'|'year'} period
 */
export async function getGlobalRadiation(coords, period) {
  const layerName = period !== 'year' ? 'globalstralning_' + period : 'globalstralning';

  const data = await getData(coords, {
    wms,
    layers: [layerName]
  });

  const key = period === 'year' ? 'year' : '--' + shortMonthToNum(data.legendGraphic.Legend[0].layerName.split('_')[1]);

  return {
    [key]: findValue(data)
  };
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handler(request) {
  const coords = getCoordsFromRequest(request);

  const [feb, apr, jun, aug, okt, dec, year, metadata] = await Promise.all([
    getGlobalRadiation(coords, 'feb'),
    getGlobalRadiation(coords, 'apr'),
    getGlobalRadiation(coords, 'jun'),
    getGlobalRadiation(coords, 'aug'),
    getGlobalRadiation(coords, 'okt'),
    getGlobalRadiation(coords, 'dec'),
    getGlobalRadiation(coords, 'year'),
    getMetaData(wms)
  ]);

  const value = Object.assign(feb, apr, jun, aug, okt, dec, year);

  return cachedResponse({
    unit: 'kWh/m²',
    value,
    metadata
  }, request);
}
